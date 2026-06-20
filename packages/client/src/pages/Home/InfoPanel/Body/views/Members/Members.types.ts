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

import { TFileLink } from "@docspace/shared/api/files/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TOption } from "@docspace/ui-kit/components/combobox";

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
  hasExternalLinks?: boolean;
  setExternalLink?: PublicRoomStore["setExternalLink"];
  setExternalLinks?: PublicRoomStore["setExternalLinks"];

  setAccessSettingsIsVisible?: DialogsStore["setTemplateAccessSettingsVisible"];

  getPrimaryLink?: FilesStore["getPrimaryLink"];

  currentId?: SelectedFolderStore["id"];
  isRootFolder?: SelectedFolderStore["isRootFolder"];
  isExternalShareRestricted?: boolean;
  defaultShareLinkInternal?: boolean;

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
  isAIAgentsFolderRoot?: boolean;

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
  isExternalShareRestricted?: boolean;
  isLinkBlockedByAdmin?: (item: TRoom, link: TFileLink) => boolean;
  isLinkRestrictedByAdmin?: (item: TRoom, link: TFileLink) => boolean;
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
