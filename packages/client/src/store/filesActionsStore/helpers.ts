/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { toastr } from "@docspace/ui-kit/components/toast";
import api from "@docspace/shared/api";
import { enableCustomFilter } from "@docspace/shared/api/files";
import { FolderType } from "@docspace/shared/enums";

import type { TTranslation } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TExportRoomIndexTask } from "@docspace/shared/api/rooms/types";

// FABLE5-REVIEW: drag&drop/upload entries are browser File objects decorated
// by still-.js callers (Home/index.js, withFileActions.js) with a relative
// path and folder markers.
export type TUploadTreeFile = File & {
  path: string;
  isEmptyDirectory?: boolean;
  parentFolderId?: number | string;
};

export type TTreeNode = {
  name: string;
  children: TTreeNode[];
  isFile: boolean;
  file: TUploadTreeFile;
};

export type TTreeLevel = {
  result: TTreeNode[];
  [name: string]: TTreeLevel | TTreeNode[] | undefined;
};

export const SECTION_ROOT_FOLDER_TYPES = [
  FolderType.Archive,
  FolderType.USER,
  FolderType.Rooms,
  FolderType.SHARE,
  FolderType.Favorites,
  FolderType.Recent,
];

export const convertToTree = (folders: TUploadTreeFile[]) => {
  const result: TTreeNode[] = [];
  const level: TTreeLevel = { result };
  try {
    folders.forEach((folder) => {
      const folderPath = folder.path.split("/").filter((name) => name !== "");

      folderPath.reduce((r, name, i) => {
        if (!r[name]) {
          r[name] = { result: [] };
          r.result.push({
            name,
            children: (r[name] as TTreeLevel).result,
            isFile: folderPath.length - 1 === i && !folder.isEmptyDirectory,
            file: folder,
          });
        }

        return r[name] as TTreeLevel;
      }, level);
    });
  } catch (e) {
    console.error("convertToTree", e);
  }
  return result;
};

export const changeCustomFilter = async (
  item: { id: number; customFilterEnabled?: boolean },
  t: TTranslation,
) => {
  // FABLE5-REVIEW: enableCustomFilter is cast to TOperation[] in
  // shared/api/files, but the server returns the updated file (the old JS
  // reads res.customFilterEnabled).
  return (
    enableCustomFilter(item.id, !item.customFilterEnabled) as unknown as Promise<TFile>
  )
    .then((res) => {
      if (res.customFilterEnabled) {
        toastr.success(t("Common:CustomFilterEnabled"));
      } else {
        toastr.success(t("Common:CustomFilterDisabled"));
      }
    })
    .catch((err) => {
      toastr.error(err as string);
    });
};

export const setPinAction = async (
  action: string,
  id: number | number[],
  t: TTranslation,
  isAIAgent = false,
) => {
  const items = Array.isArray(id) ? id : [id];

  const actions: Promise<unknown>[] = [];
  const withFinishedOperation: unknown[] = [];
  let isError = false;

  const updatingFolderList = (elems: unknown[], isPin = false) => {
    if (elems.length === 0) return;

    let translationForOneItem;
    let translationForSeverals;

    if (isAIAgent) {
      translationForOneItem = isPin
        ? t("Common:AIAgentPinned", { aiAgent: t("Common:AIAgent") })
        : t("Common:AIAgentUnpinned", { aiAgent: t("Common:AIAgent") });
      translationForSeverals = isPin
        ? t("Common:AIAgentsPinned", { aiAgents: t("Common:AIAgents") })
        : t("Common:AIAgentsUnpinned", { aiAgents: t("Common:AIAgents") });
    } else {
      translationForOneItem = isPin
        ? t("Common:RoomPinned")
        : t("Common:RoomUnpinned");
      translationForSeverals = isPin
        ? t("Common:RoomsPinned", { count: elems.length })
        : t("Common:RoomsUnpinned", { count: elems.length });
    }

    toastr.success(
      elems.length > 1 ? translationForSeverals : translationForOneItem,
    );
  };

  const isPin = action === "pin";

  items.forEach((item) => {
    // FABLE5-REVIEW: pinRoom/unpinRoom are untyped in shared/api/rooms
    // (@ts-nocheck file), the casts pin down the observed Promise result.
    actions.push(
      (isPin
        ? api.rooms.pinRoom(item)
        : api.rooms.unpinRoom(item)) as Promise<unknown>,
    );
  });

  if (isPin) {
    const result = await Promise.allSettled(actions);

    if (!result) return;

    result.forEach((res) => {
      // FABLE5-REVIEW: the old JS reads `.value` off rejected results too
      // (undefined at runtime); the erased casts keep that behavior.
      if ((res as PromiseFulfilledResult<unknown>).value) {
        withFinishedOperation.push(
          (res as PromiseFulfilledResult<unknown>).value,
        );
      }
      if (!(res as PromiseFulfilledResult<unknown>).value) isError = true;
    });

    updatingFolderList(withFinishedOperation, isPin);

    if (isError) {
      isAIAgent
        ? toastr.error(
            t("Common:AIAgentPinLimitMessage", { aiAgents: t("Common:AIAgents") }),
          )
        : toastr.error(t("Common:RoomsPinLimitMessage"));
    }

    return;
  }

  if (action === "unpin") {
    const result = await Promise.allSettled(actions);
    if (!result) return;

    result.forEach((r) => {
      if ((r as PromiseFulfilledResult<unknown>).value) {
        withFinishedOperation.push(
          (r as PromiseFulfilledResult<unknown>).value,
        );
      }
      if (!(r as PromiseFulfilledResult<unknown>).value)
        toastr.error(
          (
            r as PromiseRejectedResult & {
              reason: { response?: { data?: { error?: string } } };
            }
          ).reason.response?.data?.error,
        );
    });

    updatingFolderList(withFinishedOperation, isPin);
  }
};

export const nameWithoutExtension = (title?: string) => {
  if (!title) return "";

  const indexPoint = title.lastIndexOf(".");
  const splitTitle = title.split(".");
  const splitTitleLength = splitTitle.length;

  const titleWithoutExtension =
    splitTitleLength <= 2 ? splitTitle[0] : title.slice(0, indexPoint);

  return titleWithoutExtension;
};

export const convertToArray = <T>(itemsCollection: Map<string, T>) => {
  const result = Array.from(itemsCollection.values()).filter((item) => {
    return item != null;
  });

  itemsCollection.clear();

  return result;
};

export const checkExportRoomIndexProgress =
  async (): Promise<TExportRoomIndexTask> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const res = await api.rooms.getExportRoomIndexProgress();

          resolve(res);
        } catch (e) {
          reject(e);
        }
      }, 1000);
    });
  };
