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

import type { TFile } from "@docspace/shared/api/files/types";
import type { TNewFilesItem, TRoom } from "@docspace/shared/api/rooms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { Nullable } from "@docspace/shared/types";

import type FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import type FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import type FilesStore from "SRC_DIR/store/FilesStore";

export type NewFilesBadgeProps = {
  newFilesCount: number;
  folderId: string | number;

  isRoom?: boolean;
  mute?: boolean;

  parentDOMId?: string;
  className?: string;
  onBadgeClick?: () => void;

  newFilesPanelFolderId?: Nullable<string | number>;
  setNewFilesPanelFolderId?: (value: Nullable<string | number>) => void;
};

export type TPanelPosition = {
  top: number;
  left: number;
  maxHeight: number;
};

type MarkAsRead = FilesActionStore["markAsRead"];
type CheckAndOpenLocationAction =
  FilesActionStore["checkAndOpenLocationAction"];

export type NewFilesPanelInjectStore = {
  settingsStore: SettingsStore;
  filesActionsStore: FilesActionStore;
};

export type NewFilesPanelProps = {
  position: TPanelPosition;
  folderId: string | number;

  isRoom?: boolean;

  onClose: VoidFunction;

  culture?: string;
  markAsRead?: MarkAsRead;
};

export type TPanelDirection = "left" | "right" | "center" | "custom";

export type NewFilesPanelItemProps = {
  date: string;
  items: TNewFilesItem[];
  isRooms: boolean;
  isAgents: boolean;
  isFirst: boolean;
  onClose: VoidFunction;

  culture?: string;
};

export type NewFilesPanelItemDateProps = {
  date: string;
  culture?: string;
};

export type NewFilesPanelItemRoomProps = {
  room: TRoom;
  onClose: VoidFunction;
  openItemAction?: FilesActionStore["openItemAction"];
  getFolderInfo?: FilesStore["getFolderInfo"];
};

export type NewFilesPanelItemFileInjectStore = {
  filesSettingsStore: FilesSettingsStore;
  filesActionsStore: FilesActionStore;
  filesStore: FilesStore;
};

type GetIcon = FilesSettingsStore["getIcon"];

export type NewFilesPanelItemFileProps = {
  item: TFile;
  isRooms: boolean;
  onClose: VoidFunction;

  getIcon?: GetIcon;
  checkAndOpenLocationAction?: CheckAndOpenLocationAction;
  markAsRead?: FilesActionStore["markAsRead"];
  openDocEditor?: FilesStore["openDocEditor"];
  openItemAction?: FilesActionStore["openItemAction"];

  displayFileExtension?: boolean;
};

export type NewFilesPanelFileListProps = {
  items: TFile[];
  isRooms: boolean;
  onClose: VoidFunction;
};
