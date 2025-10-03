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

import { TFileLink } from "@docspace/shared/api/files/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TOption } from "@docspace/shared/components/combobox";

import { Nullable } from "@docspace/shared/types";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import PublicRoomStore from "SRC_DIR/store/PublicRoomStore";
import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";

export enum TInfoPanelMemberType {
  owner = "owner",
  users = "users",
  groups = "groups",
  expected = "expected",
  guests = "guests",
  administrators = "administrators",
}

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

export type TInfoPanelMembers = {
  [TInfoPanelMemberType.owner]?: TInfoPanelMember[];
  [TInfoPanelMemberType.users]: TInfoPanelMember[];
  [TInfoPanelMemberType.groups]: TInfoPanelMember[];
  [TInfoPanelMemberType.expected]: TInfoPanelMember[];
  [TInfoPanelMemberType.guests]: TInfoPanelMember[];
  [TInfoPanelMemberType.administrators]: TInfoPanelMember[];
};

type TMember = TTitleMember | TInfoPanelMember;

export type TMemberTuple = TMember[];

export type MembersProps = {
  infoPanelSelection?: InfoPanelStore["infoPanelRoomSelection"];
  isMembersPanelUpdating?: InfoPanelStore["isMembersPanelUpdating"];
  setIsMembersPanelUpdating?: InfoPanelStore["setIsMembersPanelUpdating"];
  templateAvailable?: InfoPanelStore["templateAvailableToEveryone"];

  selfId?: string;

  isPublicRoomType?: boolean;
  isFormRoom?: boolean;
  isArchiveFolder?: boolean;
  isPublicRoom?: boolean;
  isCustomRoom?: boolean;

  primaryLink?: PublicRoomStore["primaryLink"];
  additionalLinks?: PublicRoomStore["additionalLinks"];
  setExternalLink?: PublicRoomStore["setExternalLink"];
  setExternalLinks?: PublicRoomStore["setExternalLinks"];
  setPublicRoomKey?: PublicRoomStore["setPublicRoomKey"];

  setAccessSettingsIsVisible?: DialogsStore["setTemplateAccessSettingsVisible"];

  getPrimaryLink?: FilesStore["getPrimaryLink"];

  currentId?: SelectedFolderStore["id"];
  isRootFolder?: SelectedFolderStore["isRootFolder"];

  members: Nullable<TInfoPanelMembers>;
  total: number;
  searchValue: string;
  isFirstLoading: boolean;

  fetchMoreMembers: () => Promise<void>;
  changeUserRole: (
    option: TOption,
    userId: string,
    currentUserId: string,
    hasNextPage: boolean,
  ) => Promise<void>;

  scrollToTop: VoidFunction;
};

export type UserProps = {
  room: TRoom;

  user: TInfoPanelMember;
  currentUser: TInfoPanelMember;

  hasNextPage: boolean;

  searchValue: string;

  index?: number;

  changeUserRole: (
    option: TOption,
    userId: string,
    currentUserId: string,
    hasNextPage: boolean,
  ) => Promise<void>;

  setEditMembersGroup?: DialogsStore["setEditMembersGroup"];
  setEditGroupMembersDialogVisible?: DialogsStore["setEditGroupMembersDialogVisible"];
  setRemoveUserConfirmation?: DialogsStore["setRemoveUserConfirmation"];
};

export type LinkRowProps = {
  item: TRoom;
  link: TFileLink;

  roomId: string | number;
  setLinkParams?: DialogsStore["setLinkParams"];
  setEditLinkPanelIsVisible?: DialogsStore["setEditLinkPanelIsVisible"];
  setDeleteLinkDialogVisible?: DialogsStore["setDeleteLinkDialogVisible"];
  setEmbeddingPanelData?: DialogsStore["setEmbeddingPanelData"];

  isArchiveFolder?: boolean;
  isShareLink?: boolean;
  setIsScrollLocked?: InfoPanelStore["setIsScrollLocked"];
  isPublicRoomType: boolean;
  isFormRoom: boolean;
  isCustomRoom: boolean;
  setExternalLink?: PublicRoomStore["setExternalLink"];
  deleteExternalLink?: PublicRoomStore["deleteExternalLink"];
};

export type UseMembersProps = {
  room: TRoom;

  setExternalLinks: PublicRoomStore["setExternalLinks"];

  isMembersPanelUpdating: InfoPanelStore["isMembersPanelUpdating"];
  setIsMembersPanelUpdating: InfoPanelStore["setIsMembersPanelUpdating"];

  scrollToTop: VoidFunction;
};
