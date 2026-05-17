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

import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector/Selector.types";

export interface ILogoData {
  small: string;
  default: string;
}

export interface ILogo {
  id: string;
  data: ILogoData;
}

export interface ICover {
  id: string;
  data: string;
}

export interface IRoomGroup {
  id: string;
  name: string;
  icon: ILogo;
  rooms: TRoom[];
  totalRooms: number;
}

export interface ICreateRoomGroup {
  name: string;
  icon: string | null;
  rooms: string[] | null;
}

export interface IUpdateRoomGroup {
  groupName?: string;
  roomsToAdd?: (string | number)[];
  roomsToRemove?: (string | number)[];
}

export interface EditRoomGroupsDialogProps {
  currentColorScheme: TColorScheme;
  getCovers: () => void;
  covers: ICover[] | null;
  setEditRoomGroupsDialogVisible: (
    visible: boolean,
    roomIds?: number[] | null,
    openInCreateMode?: boolean,
  ) => void;
  roomGroups: IRoomGroup[];
  setCreateGroupRooms: (newGroup: ICreateRoomGroup) => Promise<void>;
  getAllRoomGroups: () => Promise<void>;
  getGroupById: (groupId: string) => Promise<IRoomGroup>;
  updateGroupIcon: (groupId: string, icon: string) => Promise<void>;
  updateRoomGroup: (groupId: string, data: IUpdateRoomGroup) => Promise<void>;
  deleteRoomGroup: (groupId: string) => Promise<void>;
  createGroupFromRoomIds?: number[] | null;
  currentFilterGroupId?: string | number | null;
  /** When true, opens the dialog with room list panel visible for creating a new group */
  openInCreateMode?: boolean;
  /** Fetches rooms to refresh the section view */
  fetchRooms: (
    folderId?: number | string | null,
    filter?: unknown,
    clearFilter?: boolean,
    withSubfolders?: boolean,
    clearSelection?: boolean,
  ) => Promise<void>;
  /** Current rooms filter */
  roomsFilter?: { groupId?: string | number | null } | null;
  /** Whether room grouping is enabled in portal settings */
  organizeRoomsGrouping?: boolean;
  /** Function to toggle room grouping setting */
  setOrganizeRoomsGrouping?: (enabled: boolean) => Promise<boolean>;
}

export interface IRoomItem {
  id?: string | number;
  [key: string]: unknown;
}

export interface DeleteGroupDialogProps {
  visible: boolean;
  groupId: string | null;
  onClose: () => void;
  deleteRoomGroup: (groupId: string) => Promise<void>;
  getAllRoomGroups: () => Promise<void>;
  currentFilterGroupId?: string | number | null;
}

export interface GroupItemProps {
  group: IRoomGroup;
  onClickGroup?: (groupId: string) => void;
  onClickEditIcon?: (groupId: string) => void;
  onClickDeleteGroup?: (groupId: string) => void;
  disabled?: boolean;
}

export interface RoomListPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (items: TSelectorItem[]) => void;
  headerLabel: string;
  selectedRooms?: TRoom[];
  withSearch?: boolean;
  disableSubmitUntilChanged?: boolean;
  sortSelectedFirst?: boolean;
  withoutBackdropBackground?: boolean;
}
