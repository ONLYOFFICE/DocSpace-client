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

import { createElement, type ReactNode } from "react";

import { FolderType } from "@onlyoffice/apps-ui-kit/enums";

import type {
  TFrameCustomActionEvent,
  TFrameCustomActions,
  TFrameCustomActionType,
  TFrameCustomContextMenuAction,
  TFrameCustomCreateAction,
  TFrameManagerSection,
} from "../types/Frame";
import { frameCallEvent } from "./common";

type TCustomActionItem = {
  fileExst?: string;
  roomType?: number;
  security?: Record<string, boolean | undefined> | null;
};

const MANAGER_SECTION_BY_ROOT: Partial<Record<number, TFrameManagerSection>> = {
  [FolderType.Rooms]: "rooms",
  [FolderType.Archive]: "archive",
  [FolderType.USER]: "my-documents",
  [FolderType.Recent]: "recent",
  [FolderType.Favorites]: "favorites",
  [FolderType.SHARE]: "shared",
  [FolderType.TRASH]: "trash",
};

export const getManagerSection = (
  rootFolderType?: number | null,
): TFrameManagerSection | undefined =>
  rootFolderType == null ? undefined : MANAGER_SECTION_BY_ROOT[rootFolderType];

const normalizeExtension = (ext: string) =>
  ext.trim().toLowerCase().replace(/^\./, "");

const inSection = (sections: string[] | undefined, section?: string) =>
  !sections || (section !== undefined && sections.includes(section));

const isContextActionVisible = (
  action: TFrameCustomContextMenuAction,
  type: TFrameCustomActionType,
  item: TCustomActionItem,
  section?: string,
) => {
  if (!inSection(action.section, section)) return false;

  if (action.extensions && type === "file") {
    const ext = normalizeExtension(item.fileExst ?? "");
    if (!action.extensions.some((e) => normalizeExtension(e) === ext))
      return false;
  }

  if (action.roomTypes && type === "room") {
    if (item.roomType === undefined || !action.roomTypes.includes(item.roomType))
      return false;
  }

  if (action.requireSecurity) {
    const security = item.security ?? {};
    if (!action.requireSecurity.every((flag) => security[flag] === true))
      return false;
  }

  return true;
};

export const getVisibleContextActions = (
  config: TFrameCustomActions | null | undefined,
  type: TFrameCustomActionType,
  item: TCustomActionItem,
  section?: string,
): TFrameCustomContextMenuAction[] =>
  (config?.contextMenu?.[type] ?? []).filter((action) =>
    isContextActionVisible(action, type, item, section),
  );

export const getVisibleGroupContextActions = (
  config: TFrameCustomActions | null | undefined,
  entries: { type: TFrameCustomActionType; item: TCustomActionItem }[],
  section?: string,
): TFrameCustomContextMenuAction[] => {
  if (entries.length === 0) return [];

  const { type } = entries[0];
  if (entries.some((entry) => entry.type !== type)) return [];

  return (config?.contextMenu?.[type] ?? []).filter((action) =>
    entries.every((entry) =>
      isContextActionVisible(action, type, entry.item, section),
    ),
  );
};

export const getVisibleCreateActions = (
  config: TFrameCustomActions | null | undefined,
  section?: string,
): TFrameCustomCreateAction[] =>
  (config?.createMenu ?? []).filter((action) =>
    inSection(action.section, section),
  );

export const getCustomActionIconProps = (
  icon?: string,
): { icon: string; iconNode?: ReactNode } => {
  if (!icon || icon.startsWith("data:")) return { icon: icon ?? "" };

  return {
    icon,
    iconNode: createElement("img", { src: icon, alt: "", width: 16, height: 16 }),
  };
};

export const sendCustomAction = (event: TFrameCustomActionEvent) => {
  frameCallEvent({ event: "onCustomAction", data: event });
};
