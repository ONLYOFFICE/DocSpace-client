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

import type React from "react";
import copy from "copy-to-clipboard";
import config from "PACKAGE_FILE";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { TTranslation } from "@docspace/shared/types";
import type {
  TFileSecurity,
  TFileViewAccessibility,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
import {
  Events,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import {
  setView,
  showInfoPanel,
} from "SRC_DIR/helpers/info-panel";

export const systemFolders = [
  FolderType.InProgress,
  FolderType.Done,
  FolderType.SubFolderDone,
  FolderType.SubFolderInProgress,
];

export type TContextItemSecurity = Partial<
  TFileSecurity & TFolderSecurity & TRoomSecurity
>;

export type TContextItem = {
  id: number;
  title: string;
  access?: ShareAccessRights;
  security?: TContextItemSecurity;
  viewAccessibility?: TFileViewAccessibility;
  contextOptions?: string[];
  fileExst?: string;
  exst?: string | null;
  folderId?: number;
  parentId?: number;
  rootFolderId?: number;
  rootFolderType?: FolderType;
  parentRoomType?: FolderType;
  roomType?: RoomsType;
  type?: FolderType;
  providerKey?: string;
  providerId?: number;
  external?: boolean;
  isLinkExpired?: boolean;
  passwordProtected?: boolean;
  shared?: boolean;
  canShare?: boolean;
  href?: string;
  webUrl?: string;
  viewUrl?: string;
  shortWebUrl?: string;
  canOpenPlayer?: boolean;
  locked?: boolean;
  encrypted?: boolean;
  isFolder?: boolean;
  isRoom?: boolean;
  isAIAgent?: boolean;
  isTemplate?: boolean;
  isEdit?: boolean;
  isEditing?: boolean;
  isPDFForm?: boolean;
  startFilling?: boolean;
  inRoom?: boolean;
  pinned?: boolean;
  requestToken?: string;
  customFilterEnabled?: boolean;
  customFilterEnabledBy?: string;
  indexing?: boolean;
  isInsideKnowledge?: boolean;
  isInsideResultStorage?: boolean;
  sendFormToExternalDB?: boolean;
};

// the option shape this store builds is looser than ui-kit's
// ContextMenuModel (store-specific onClick signatures, string-keyed
// separators); results are cast to ContextMenuModel[] at the public
// boundaries. Align with ContextMenuModel once the .js consumers are typed.
export type TContextOption = {
  id?: string;
  key: string;
  label?: React.ReactNode;
  icon?: string;
  disabled?: boolean | string;
  isSeparator?: boolean;
  onClick?: (...args: never[]) => unknown;
  items?: TContextOption[];
  className?: string;
  placement?: "top" | "topLast";
};

type TMenuGroupKey = string | { key: string };

export type TMenuGroupConfig = {
  groupKey: string;
  groupLabel: React.ReactNode;
  groupIcon?: string;
  itemKeys: TMenuGroupKey[] | { key: string }[][];
  needsGrouping?: boolean;
  minItemsCount?: number;
};

type TCreateEventPayload = {
  extension?: string;
  id?: number;
  fromTemplate?: boolean;
  title?: string;
  openEditor?: boolean;
  edit?: boolean;
  isFormsCreate?: boolean;
  // ROOM_CREATE only: opens the create-room dialog on this preset type and
  // locks the type chooser (read by GlobalEvents / CreateRoomEvent).
  startRoomType?: RoomsType;
};

// the still-.js GlobalEvents component reads these extra
// fields off the dispatched CustomEvent.
export type TStoreCustomEvent = CustomEvent & {
  item?: TContextItem;
  cb?: (room: TRoom) => void;
  payload?: TCreateEventPayload;
  title?: string;
};

export const onClickLinkForPortal = (item: TContextItem, t: TTranslation) => {
  const { fileExst, canOpenPlayer, webUrl, id } = item;

  const isFile = !!fileExst;
  // the original .js passed a possibly-undefined webUrl
  // through to copy() unchecked — the cast keeps that behavior.
  copy(
    isFile
      ? canOpenPlayer
        ? `${window.location.href}&preview=${id}`
        : (webUrl as string)
      : `${window.location.origin + config.homepage}/filter?folder=${id}`, // TODO: Change url by category
  );

  toastr.success(t("Common:LinkCopySuccess"));
};

export const filterModel = (model: TContextOption[], filter: string[]) => {
  const options: TContextOption[] = [];
  let index = 0;
  const last = model.length;

  // Keys that should preserve their items without filtering
  const preserveItemsKeys = ["add-to-group"];

  for (index; index < last; index++) {
    if (filter.includes(model[index].key)) {
      options[index] = model[index];
      if (model[index].items) {
        // Skip filtering items for keys that need to preserve dynamic items
        if (!preserveItemsKeys.includes(model[index].key)) {
          options[index].items = model[index].items!.filter((item) =>
            filter.includes(item.key),
          );

          if (options[index].items!.length === 1) {
            options[index] = options[index].items![0];
          }
        }
      }
    }
  }

  return options.filter((o) => !!o);
};

// every current call site passes only `item`, so `view` is
// undefined at runtime; the cast preserves that pre-existing behavior of
// calling setView(undefined).
export const onShowInfoPanel = (item?: TContextItem, view?: string) => {
  showInfoPanel();

  if (item) {
    setView(view as string);
  }
};

export const onClickEditRoom = (item: TContextItem) => {
  const event: TStoreCustomEvent = new CustomEvent(Events.ROOM_EDIT, {
    detail: { context: "context_menu" },
  });
  event.item = item;
  window.dispatchEvent(event);
};

export const onClickEditAgent = (item: TContextItem) => {
  const event: TStoreCustomEvent = new CustomEvent(Events.AGENT_EDIT, {
    detail: { context: "context_menu" },
  });
  event.item = item;
  window.dispatchEvent(event);
};

export const onEditRoomTemplate = (
  item: TContextItem,
  cb?: (room: TRoom) => void,
) => {
  const event: TStoreCustomEvent = new CustomEvent(Events.ROOM_EDIT, {
    detail: { context: "context_menu" },
  });
  event.item = { ...item, isEdit: true };
  event.cb = cb;
  window.dispatchEvent(event);
};

export function placePlugins(
  result: TContextOption[],
  pluginItems: TContextOption[],
) {
  const newResult = [...result];
  const placementPlugins = pluginItems.filter((p) => p.placement);

  placementPlugins.forEach((option) => {
    if (option.placement === "top") {
      newResult.splice(0, 0, option);
    }

    if (option.placement === "topLast") {
      const firstSepIdx = newResult.findIndex((o) => o.isSeparator);
      const insertAt = firstSepIdx !== -1 ? firstSepIdx : newResult.length;
      newResult.splice(insertAt, 0, option);
    }
  });
  return newResult;
}

export const onShowEditingToast = (t: TTranslation) => {
  toastr.error(t("Files:DocumentEdited"));
};

export const onShowWaitOperationToast = (t: TTranslation) => {
  toastr.warning(t("Files:WaitOperation"));
};

export const onSuggestOformChanges = (item: { title?: string } | null) => {
  const formTitle = item?.title;

  // assigning a string to window.location is valid at
  // runtime (navigates) but lib.dom types the setter stricter — the cast
  // keeps the original statement.
  window.location = `mailto:marketing@onlyoffice.com
    ?subject=Suggesting changes for ${formTitle}
    &body=Suggesting changes for ${formTitle}.
  ` as unknown as string & Location;
};

export const createMenuGroup = (
  options: TContextOption[],
  groupConfig: TMenuGroupConfig,
) => {
  const {
    groupKey,
    groupLabel,
    groupIcon,
    itemKeys,
    needsGrouping = false,
    minItemsCount = 1,
  } = groupConfig;

  let groupItems: TContextOption[] = [];

  if (needsGrouping) {
    let lastNonEmptyGroupIndex = -1;

    // needsGrouping callers always pass nested
    // { key }[][] itemKeys — the cast reflects that contract.
    (itemKeys as { key: string }[][]).forEach((group, groupIndex) => {
      const groupSubItems = group
        .map((groupItem) =>
          options.find((option) => option.key === groupItem.key),
        )
        .filter((menuItem): menuItem is TContextOption =>
          Boolean(menuItem && menuItem.disabled !== true),
        );

      if (groupSubItems.length > 0) {
        if (lastNonEmptyGroupIndex !== -1) {
          groupItems.push({
            key: `separator-after-group-${lastNonEmptyGroupIndex}`,
            isSeparator: true,
          });
        }

        groupSubItems.forEach((menuItem) => groupItems.push(menuItem));
        lastNonEmptyGroupIndex = groupIndex;
      }
    });
  } else {
    groupItems = (itemKeys as TMenuGroupKey[])
      .map((item) =>
        options.find(
          (option) =>
            option.key === (typeof item === "object" ? item.key : item),
        ),
      )
      .filter((option): option is TContextOption =>
        Boolean(option && option.disabled !== true),
      );
  }

  const itemsCount = groupItems.filter(
    (menuItem) => !menuItem.isSeparator && menuItem.disabled !== true,
  ).length;

  const shouldAddGroup = itemsCount > minItemsCount;

  return {
    group: shouldAddGroup
      ? {
          id: `option_${groupKey}`,
          key: groupKey,
          label: groupLabel,
          icon: groupIcon,
          items: groupItems,
        }
      : null,
    keysToRemove: shouldAddGroup
      ? needsGrouping
        ? (itemKeys as { key: string }[][]).flat().map((item) => item.key)
        : (itemKeys as TMenuGroupKey[]).map((item) =>
            typeof item === "object" ? item.key : item,
          )
      : [],
  };
};

export const onUploadAction = (type: "file" | "pdf" | "folder") => {
  const element =
    type === "file"
      ? document.getElementById("customFileInput")
      : type === "pdf"
        ? document.getElementById("customPDFInput")
        : document.getElementById("customFolderInput");

  element?.click();
};
