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

import React from "react";
import type { TFunction } from "i18next";
import type { DateTime } from "luxon";
import type { IndexRange } from "react-virtualized";

import type { TFile, TFileLink, TFolder } from "../../api/files/types";
import type { LinkParamsType, TAvailableShareRights } from "../../types";
import type { ShareAccessRights } from "../../enums";

import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { TUser } from "../../api/people/types";
import type { TGroup } from "../../api/groups/types";
import type { RoomMember } from "../../api/rooms/types";

export type ShareCalendarProps = {
  onDateSet: (formattedDate: DateTime) => void;
  closeCalendar: () => void;
  calendarRef: React.RefObject<HTMLDivElement | null>;
  locale: string;
  bodyRef?: React.RefObject<HTMLDivElement | null>;
  useDropDown?: boolean;
};
export type DefaultCreatePropsType = {
  access: ShareAccessRights;
  internal: boolean;
  diffExpirationDate?: number | null;
};

export type AccessItem = { access?: ShareAccessRights };

export type TLink = TFileLink | { key: string; isLoaded: boolean };

export type LinkRowProps = {
  onAddClick?: () => Promise<void>;
  links: TLink[] | null;

  changeShareOption: (item: TOption, link: TFileLink) => void;
  changeAccessOption?: (item: AccessItem, link: TFileLink) => Promise<void>;

  changeExpirationOption: (
    link: TFileLink,
    expirationDate: DateTime | null,
  ) => Promise<void>;

  removedExpiredLink: (link: TFileLink) => void;

  availableShareRights?: TAvailableShareRights;

  loadingLinks: (string | number)[];

  isFolder?: boolean;

  onCopyLink: (link: TFileLink) => void;
  getData: (link: TFileLink) => ContextMenuModel[];
  onOpenContextMenu: (e: React.MouseEvent) => void;
  onCloseContextMenu: () => void;

  isShareLink?: boolean;
  hideLinkTypeSelector?: boolean;
  isExternalShareRestricted?: boolean;
} & (
  | {
      isRoomsLink?: undefined | false;
      isArchiveFolder?: undefined;
      onAccessRightsSelect?: never;
    }
  | {
      isRoomsLink: true;
      isArchiveFolder: boolean;
      onAccessRightsSelect: (option: TOption) => void;
    }
);

export type ExpiredComboBoxProps = {
  link: TFileLink;
  changeExpirationOption: (
    link: TFileLink,
    expirationDate: DateTime | null,
  ) => Promise<void>;
  isDisabled?: boolean;
  removedExpiredLink: (link: TFileLink, isReactivate: boolean) => void;
};

export type ShareProps = {
  infoPanelSelection: TFile | TFolder;
  isExternalShareRestricted?: boolean;
  blockExistingLinksOnRestrict?: boolean;
  defaultShareLinkInternal?: boolean;
  setEmbeddingPanelData?: (value: {
    visible: boolean;
    item?: TFile | TFolder;
  }) => void;

  setView?: (view: string) => void;

  shareChanged?: boolean;
  setShareChanged?: (value: boolean) => void;

  selfId?: string;
  onOpenPanel?: (options: {
    visible: boolean;
    updateAccessLink: () => Promise<void>;
    fileId: string | number;
  }) => void;
  onlyOneLink?: boolean;

  setIsScrollLocked?: (isScrollLocked: boolean) => void;
  setEditLinkPanelIsVisible: (value: boolean) => void;
  setLinkParams: (linkParams: LinkParamsType) => void;
  fileLinkProps?: TFileLink[];
  members?: RoomMember[];
  shareMembersTotal?: number;
  isEditor?: boolean;
  onAddUser?: (item: TFolder | TFile) => void;
  disabledSharedUser?: boolean;
  hideLinkTypeSelector?: boolean;
  onClickGroup?: (group: TGroup) => void;
};

export interface LinkTitleProps {
  t: TFunction;
  linkTitle: string;
  isExpiredLink: boolean;
  onCopyLink: VoidFunction;
  shareLink: string;

  isLoaded?: boolean;
  disabledCopy?: boolean;
  isBlockedByAdmin?: boolean;
}

export type TCopyShareLinkOptions = {
  canShowLink: boolean;
  onClickLink: VoidFunction;
};

export type TShareBarProps = {
  t: TFunction;
  isFolder?: boolean;
  parentShared?: boolean;
  selfId?: string;
  isEditor?: boolean;
};

export interface UseMembersProps {
  members: RoomMember[] | undefined;
  selfId: string | undefined;
  shareMembersTotal: number;
  infoPanelSelection: TFile | TFolder;

  linksCount: number;
  onAddUser?: (item: TFolder | TFile) => void;
  disabledSharedUser?: boolean;
  onClickGroup?: (group: TGroup) => void;
}

export interface UseShareProps {
  infoPanelSelection: TFile | TFolder;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditLinkPanelIsVisible: (value: boolean) => void;
  setLinkParams: (linkParams: LinkParamsType) => void;

  onlyOneLink?: boolean;
  shareChanged?: boolean;
  setShareChanged?: (value: boolean) => void;

  fileLinkProps?: TLink[];
  setView?: (view: string) => void;
  setIsScrollLocked?: (isScrollLocked: boolean) => void;
  isExternalShareRestricted?: boolean;
  blockExistingLinksOnRestrict?: boolean;
  defaultShareLinkInternal?: boolean;
  onOpenPanel?: (options: {
    visible: boolean;
    updateAccessLink: () => Promise<void>;
    fileId: string | number;
  }) => void;
  setEmbeddingPanelData?: (value: {
    visible: boolean;
    item?: TFile | TFolder;
  }) => void;
  hideLinkTypeSelector?: boolean;
}

export type TTitleID =
  | "owner"
  | "groups"
  | "users"
  | "guests"
  | "expected"
  | "administrators";

export type TTitleShare = {
  id: TTitleID;
  displayName: string;
  isTitle: true;
  isExpect?: boolean;
};

export type TShareMember = {
  access: number;
  canEditAccess: boolean;
  isExpect?: boolean;
} & (TUser | TGroup);

export type TShare = TTitleShare | TShareMember;
export type TShareMembers = Record<TTitleID, TShare[]>;

export interface UserProps {
  user: TShare;
  currentUser: TShareMember;

  options?: TOption[];
  hideCombobox?: boolean;
  selectedOption?: TOption;
  onSelectOption?: (option: TOption) => Promise<void>;

  showInviteIcon?: boolean;
  onRepeatInvitation?: () => Promise<void>;

  onClickGroup?: (group: TGroup) => void;

  index?: number;
}

export type ListProps = {
  hasNextPage: boolean;
  itemCount: number;
  loadNextPage: (params: IndexRange) => Promise<void>;
  linksBlockLength: number;
  withoutTitlesAndLinks: boolean;
  restrictedBarVisible?: boolean;
  children: React.ReactNode;
};

export type Filter = {
  startIndex: number;
  count: number;
};
