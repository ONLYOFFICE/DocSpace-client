// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { TFile } from "@docspace/shared/api/files/types";
import { TNewFilesItem, TRoom } from "@docspace/shared/api/rooms/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Nullable } from "@docspace/shared/types";

import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import FilesStore from "SRC_DIR/store/FilesStore";

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
