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
}
