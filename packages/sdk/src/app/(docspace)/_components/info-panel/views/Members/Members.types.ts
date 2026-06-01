// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { useTranslation } from "react-i18next";

import type { TOption } from "@docspace/ui-kit/components/combobox";

import type { TRoom } from "@docspace/shared/api/rooms/types";
import type {
  TFile,
  TFolder,
  TFileLink,
} from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TGroup } from "@docspace/shared/api/groups/types";

export type TRoleOption = TOption & { access?: number };

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
  selection: TFile | TFolder;
};

export type UseMembersProps = {
  room: TRoom | null;
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

  onOpenGroup: (group: TGroup) => void;
};

export type LinkRowProps = {
  link: TFileLink;
  selection: TFile | TFolder;
  t: ReturnType<typeof useTranslation>["t"];
  onLinkUpdate: (updated: TFileLink) => void;
  onLinkRemoved: () => void;
};
