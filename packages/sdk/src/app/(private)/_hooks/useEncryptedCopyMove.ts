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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useEncryption } from "@docspace/shared/context/encryption";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getFolder, deleteFile } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TGetFolder } from "@docspace/shared/api/files/types";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";
import { resolveEncryptedCopyDest } from "../_utils/encrypted-copy-dest";
import { useEncryptedUpload } from "./useEncryptedUpload";

type EncryptedSourceItem = {
  id: number;
  title: string;
  viewUrl: string;
  contentType?: string;
  fileExst?: string;
};

type DuplicateArgs = {
  item: EncryptedSourceItem;
  roomId: number | string;
  folderId: number | string;
};

type CopyMoveArgs = {
  files: EncryptedSourceItem[];
  destFolderId: number | string;
  // The room the files currently live in — needed to unwrap their DEKs.
  sourceRoomId: number | string;
};

type UseEncryptedCopyMoveReturn = {
  duplicateFile: (args: DuplicateArgs) => Promise<void>;
  copyFiles: (args: CopyMoveArgs) => Promise<void>;
  moveFiles: (args: CopyMoveArgs) => Promise<void>;
};

const loadCopyModule = () =>
  import("@docspace/shared/services/private-room/encrypted-copy");

export const useEncryptedCopyMove = (): UseEncryptedCopyMoveReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const filesListStore = useFilesListStore();
  const { uploadFiles } = useEncryptedUpload();

  const duplicateFile = React.useCallback(
    async ({ item, roomId, folderId }: DuplicateArgs) => {
      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) return;

      const controller = registerCryptoOperation();
      try {
        const { decryptEncryptedItemToFile, addCopySuffix } =
          await loadCopyModule();

        const decrypted = await decryptEncryptedItemToFile(
          {
            id: item.id,
            title: item.title,
            viewUrl: item.viewUrl,
            contentType: item.contentType,
            fileExst: item.fileExst,
          },
          userId,
          identity,
          roomId,
        );

        if (controller.signal.aborted) return;

        const copyFile = new File([decrypted], addCopySuffix(decrypted.name), {
          type: decrypted.type || "application/octet-stream",
        });

        await uploadFiles({ files: [copyFile], folderId, roomId });
      } catch (error) {
        if (controller.signal.aborted) return;
        const msg = error instanceof Error ? error.message : String(error);
        toastr.error(msg);
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, uploadFiles, t],
  );

  const runCopyMove = React.useCallback(
    async (
      { files, destFolderId, sourceRoomId }: CopyMoveArgs,
      isMove: boolean,
    ) => {
      if (files.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) return;

      const controller = registerCryptoOperation();
      try {
        const destFolderData = (await getFolder(
          destFolderId as number,
          FilesFilter.getDefault(),
        )) as TGetFolder;
        const dest = resolveEncryptedCopyDest(destFolderData);

        if (!dest.allowed) {
          toastr.error(t("Common:PrivateRoomCopyOutNotSupported"));
          return;
        }
        const destRoomId = dest.roomId;

        const { decryptEncryptedItemToFile } = await loadCopyModule();

        for (const item of files) {
          if (controller.signal.aborted) return;

          const decrypted = await decryptEncryptedItemToFile(
            {
              id: item.id,
              title: item.title,
              viewUrl: item.viewUrl,
              contentType: item.contentType,
              fileExst: item.fileExst,
            },
            userId,
            identity,
            sourceRoomId,
          );

          if (controller.signal.aborted) return;

          await uploadFiles({
            files: [decrypted],
            folderId: destFolderId,
            roomId: destRoomId,
          });

          if (isMove) {
            await deleteFile(item.id, false, true);
            filesListStore.removeItem(item.id);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const msg = error instanceof Error ? error.message : String(error);
        toastr.error(msg);
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, uploadFiles, filesListStore, t],
  );

  const copyFiles = React.useCallback(
    (args: CopyMoveArgs) => runCopyMove(args, false),
    [runCopyMove],
  );

  const moveFiles = React.useCallback(
    (args: CopyMoveArgs) => runCopyMove(args, true),
    [runCopyMove],
  );

  return { duplicateFile, copyFiles, moveFiles };
};
