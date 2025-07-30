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

import React from "react";
import moment from "moment";
import type {
  TAvailableExternalRights,
  TFile,
  TFileLink,
  TFolder,
} from "../../api/files/types";
import type { LinkParamsType } from "../../types";
import type { ShareAccessRights } from "../../enums";

import type { TOption } from "../combobox";

export type ShareCalendarProps = {
  onDateSet: (formattedDate: moment.Moment) => void;
  closeCalendar: (formattedDate: moment.Moment) => void;
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

export type TLink = TFileLink | { isLoaded: boolean };

export type LinkRowProps = {
  onAddClick?: () => Promise<void>;
  links: TLink[] | null;

  changeShareOption: (item: TOption, link: TFileLink) => void;
  changeAccessOption?: (item: AccessItem, link: TFileLink) => Promise<void>;

  changeExpirationOption: (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => Promise<void>;

  removedExpiredLink: (link: TFileLink) => void;

  availableExternalRights?: TAvailableExternalRights;

  loadingLinks: (string | number)[];

  isFormRoom?: boolean;
  isCustomRoom?: boolean;
  isFolder?: boolean;
  isPublicRoom?: boolean;

  getData: (link: TFileLink) => ContextMenuModel[];
  onOpenContextMenu: (e: React.MouseEvent) => void;
  onCloseContextMenu: () => void;
} & (
  | {
      isRoomsLink?: undefined | false;
      isPrimaryLink?: undefined;
      isArchiveFolder?: undefined;
      onAccessRightsSelect?: never;
    }
  | {
      isRoomsLink: true;
      isPrimaryLink: boolean;
      isArchiveFolder: boolean;
      onAccessRightsSelect: (option: TOption) => void;
    }
);

export type ExpiredComboBoxProps = {
  link: TFileLink;
  changeExpirationOption: (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => Promise<void>;
  isDisabled?: boolean;
  isRoomsLink?: boolean;
  removedExpiredLink: (link: TFileLink) => void;
};

export type ShareProps = {
  infoPanelSelection: TFile | TFolder;
  setEmbeddingPanelData?: (value: {
    visible: boolean;
    item: TFile | TFolder;
  }) => void;

  setView?: (view: string) => void;

  shareChanged?: boolean;
  setShareChanged?: (value: boolean) => void;

  getPrimaryFileLink?: (id: string | number) => Promise<TFileLink>;
  editFileLink?: (
    fileId: number | string,
    linkId: number | string,
    access: ShareAccessRights,
    primary: boolean,
    internal: boolean,
    expirationDate: moment.Moment,
  ) => Promise<TFileLink>;
  addFileLink?: (
    fileId: number | string,
    access: ShareAccessRights,
    primary: boolean,
    internal: boolean,
    expirationDate?: moment.Moment | null,
  ) => Promise<TFileLink>;

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
};
