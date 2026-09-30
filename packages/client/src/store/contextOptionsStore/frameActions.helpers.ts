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

import type { TFrameCustomActionType } from "@docspace/shared/types/Frame";
import {
  getManagerSection,
  getVisibleContextActions,
  getVisibleCreateActions,
  getVisibleGroupContextActions,
  sendCustomAction,
} from "@docspace/shared/utils/frameCustomActions";
import {
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";

import type { TContextItem, TContextOption } from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";
import type { TSelectionItem } from "./types";

const getItemType = (item: unknown): TFrameCustomActionType => {
  if (isRoomUtil(item)) return "room";
  if (isFolderUtil(item)) return "folder";
  return "file";
};

const getContext = (self: ContextOptionsStore) => {
  const { isFrame, frameCustomActions } = self.settingsStore;
  const { rootFolderType, id } = self.selectedFolderStore;

  return {
    config: isFrame ? frameCustomActions : null,
    section: getManagerSection(rootFolderType),
    folderId: id ?? undefined,
  };
};

export const onLoadFrameActionsImpl = (
  self: ContextOptionsStore,
  item: TContextItem,
): TContextOption[] => {
  const { config, section, folderId } = getContext(self);
  if (!config) return [];

  const type = getItemType(item);

  return getVisibleContextActions(config, type, item, section).map(
    (action) => ({
      id: `option_sdk-action-${action.key}`,
      key: `sdk-action-${action.key}`,
      label: action.label,
      icon: action.icon,
      disabled: false,
      onClick: () =>
        sendCustomAction({
          action: action.key,
          type,
          item,
          items: [item],
          folderId,
        }),
    }),
  );
};

export const onMultiLoadFrameActionsImpl = (
  self: ContextOptionsStore,
  items: TSelectionItem[],
): TContextOption[] => {
  const { config, section, folderId } = getContext(self);
  if (!config) return [];

  const entries = items.map((item) => ({ type: getItemType(item), item }));
  const type = entries[0]?.type;

  return getVisibleGroupContextActions(config, entries, section).map(
    (action) => ({
      id: `option_sdk-action-${action.key}`,
      key: `sdk-action-${action.key}`,
      label: action.label,
      icon: action.icon,
      disabled: false,
      onClick: () =>
        sendCustomAction({
          action: action.key,
          type,
          items,
          folderId,
        }),
    }),
  );
};

export const getFrameCreateActionsImpl = (
  self: ContextOptionsStore,
): TContextOption[] => {
  const { config, section, folderId } = getContext(self);
  if (!config) return [];

  return getVisibleCreateActions(config, section).map((action) => ({
    id: `personal_sdk-action-${action.key}`,
    key: `sdk-action-${action.key}`,
    label: action.label,
    icon: action.icon,
    onClick: () =>
      sendCustomAction({ action: action.key, type: "create", folderId }),
  }));
};
