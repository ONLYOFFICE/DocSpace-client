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
