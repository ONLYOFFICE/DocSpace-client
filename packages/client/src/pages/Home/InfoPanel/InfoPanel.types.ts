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

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TUser } from "@docspace/shared/api/people/types";

import {
  RoomMember,
  TFeedAction,
  TFeedData,
  TLogo,
  TRoom,
} from "@docspace/shared/api/rooms/types";

import { Nullable } from "@docspace/shared/types";
import { TPeopleListItem } from "SRC_DIR/store/contacts/UsersStore";
import { TSelectedFolder } from "SRC_DIR/store/SelectedFolderStore";

// export type TInfoPanelSelection =
//   | TFile
//   | TFolder
//   | (TFile | TFolder)[]
//   | TRoom
//   | TRoom[]
//   | TUser
//   | TUser[]
//   | TGroup
//   | TGroup[]
//   | null;

export enum TInfoPanelMemberType {
  users = "users",
  groups = "groups",
  expected = "expected",
  guests = "guests",
  administrators = "administrators",
}

export const enum InfoPanelView {
  infoMembers = "info_members",
  infoHistory = "info_history",
  infoDetails = "info_details",
  infoShare = "info_share",
}

export type HistoryFilter = {
  page: number;
  pageCount: number;
  total: number;
  startIndex: number;
};

export type TTitleMember = {
  id: TInfoPanelMemberType;
  displayName: string;
  isTitle: true;
  isExpect?: boolean;
};

export type TInfoPanelMember = {
  access: number;
  canEditAccess: boolean;
  isExpect?: boolean;
} & (TUser | TGroup);

export type TInfoPanelMembers = Record<
  TInfoPanelMemberType,
  TInfoPanelMember[]
> & {
  roomId: number | string;
};

type TMember = TTitleMember | TInfoPanelMember;

export type TMemberTuple = TMember[];

export type TSelection = (
  | TFile
  | TFolder
  | TPeopleListItem
  | TGroup
  | TSelectedFolder
  | TRoom
) & {
  isRoom?: boolean;
  logo?: Nullable<TLogo>;
  icon?: string | TLogo;
};

export type TInfoPanelSelection = Nullable<TSelection>;

export type TSelectionHistory = {
  day: string;
  feeds: TFeedAction<TFeedData | RoomMember>[];
};
