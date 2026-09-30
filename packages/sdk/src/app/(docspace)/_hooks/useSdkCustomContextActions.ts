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

import { useCallback } from "react";

import type {
  TFrameCustomActionEvent,
  TFrameCustomActionType,
  TFrameCustomContextMenuAction,
} from "@docspace/shared/types/Frame";
import {
  getVisibleContextActions,
  getVisibleGroupContextActions,
  sendCustomAction,
} from "@docspace/shared/utils/frameCustomActions";

import { useSdkCustomActions } from "@/providers/SdkCustomActionsProvider";
import {
  docsSectionFromRootFolderType,
  toFrameEntity,
} from "@/utils/frameEntity";

import { useFilesListStore } from "../_store/FilesListStore";
import type { TFileItem, TFolderItem } from "./useItemList";

type TListItem = TFileItem | TFolderItem;

type TCustomMenuItem = {
  id: string;
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
};

const getItemType = (item: TListItem): TFrameCustomActionType =>
  "isFolder" in item && item.isFolder ? "folder" : "file";

const toMenuItem = (
  action: TFrameCustomContextMenuAction,
  event: Omit<TFrameCustomActionEvent, "action">,
): TCustomMenuItem => ({
  id: `option_sdk-action-${action.key}`,
  key: `sdk-action-${action.key}`,
  label: action.label,
  icon: action.icon ?? "",
  disabled: false,
  onClick: () => sendCustomAction({ action: action.key, ...event }),
});

export default function useSdkCustomContextActions() {
  const { customActions } = useSdkCustomActions();
  const filesListStore = useFilesListStore();

  const getItemCustomActions = useCallback(
    (item: TListItem): TCustomMenuItem[] => {
      if (!customActions) return [];

      const type = getItemType(item);
      const section =
        docsSectionFromRootFolderType(filesListStore.rootFolderType) ??
        undefined;
      const entity = toFrameEntity(item);

      return getVisibleContextActions(customActions, type, item, section).map(
        (action) =>
          toMenuItem(action, {
            type,
            item: entity,
            items: [entity],
            folderId: filesListStore.currentFolder?.id,
          }),
      );
    },
    [customActions, filesListStore],
  );

  const getGroupCustomActions = useCallback(
    (items: TListItem[]): TCustomMenuItem[] => {
      if (!customActions || !items.length) return [];

      const entries = items.map((item) => ({ type: getItemType(item), item }));
      const section =
        docsSectionFromRootFolderType(filesListStore.rootFolderType) ??
        undefined;
      const entities = items.map(toFrameEntity);

      return getVisibleGroupContextActions(customActions, entries, section).map(
        (action) =>
          toMenuItem(action, {
            type: entries[0].type,
            items: entities,
            folderId: filesListStore.currentFolder?.id,
          }),
      );
    },
    [customActions, filesListStore],
  );

  return { getItemCustomActions, getGroupCustomActions };
}
