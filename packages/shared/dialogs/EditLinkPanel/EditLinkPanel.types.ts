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

import type { ChangeEventHandler, Ref } from "react";

import type { DeviceType } from "../../enums";
import type { TRoom } from "../../api/rooms/types";
import type { LinkParamsType, Nullable, TTranslation } from "../../types";
import type { TPasswordSettings } from "../../api/settings/types";
import type { TFile, TFileLink, TFolder } from "../../api/files/types";
import type {
  getLinkAccessRightOptions,
  getAccessTypeOptions,
} from "../../components/share/Share.helpers";

export interface EditLinkPanelRef {
  hasChanges: () => boolean;
  openChangesDialog: (from: "back" | "close") => void;
}

type ExternalLinkType =
  | {
      searchParams?: never;
      setExternalLink?: never;
      setSearchParams?: never;
    }
  | {
      setExternalLink: (link: TFileLink) => void;
      searchParams: URLSearchParams;
      setSearchParams: (searchParams: URLSearchParams) => void;
    };

export type EditLinkPanelProps = ExternalLinkType & {
  link: TFileLink;
  item: TFolder | TRoom | TFile;
  language: string;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;

  setLinkParams: (linkParams: LinkParamsType | null) => void;
  currentDeviceType: DeviceType;
  passwordSettings: TPasswordSettings | undefined;
  getPortalPasswordSettings: () => Promise<void>;

  ref?: Ref<EditLinkPanelRef>;
  withBackButton?: boolean;

  onClose?: VoidFunction;
  updateLink?: (link: TFileLink) => void;
};

export interface ToggleBlockProps {
  headerText: string;
  isChecked?: boolean;
  isLoading?: boolean;
  bodyText?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  isExpired?: boolean;
  tooltipContent?: string;
  withToggle?: boolean;
  isDisabled?: boolean;
  dataTestId?: string;
}

export interface LinkBlockProps {
  t: TTranslation;
  isLoading: boolean;
  linkNameValue: string;
  setLinkNameValue: (value: string) => void;
}
export interface PasswordAccessBlockProps {
  t: TTranslation;
  isLoading: boolean;
  isChecked: boolean;
  bodyText: string;
  headerText: string;
  passwordValue: string;
  setPasswordValue: (value: string) => void;
  isPasswordValid: boolean;
  setIsPasswordValid: (value: boolean) => void;
  passwordSettings: TPasswordSettings | undefined;
  isPasswordErrorShow: boolean;
  setIsPasswordErrorShow: (value: boolean) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export interface LimitTimeBlockProps {
  language: string;
  bodyText: string;
  headerText: string;
  isLoading: boolean;
  isExpired: boolean;
  canChangeLifetime: boolean;
  expirationDate: Nullable<string>;
  setIsExpired: (value: boolean) => void;
  setExpirationDate: (value: string | null) => void;
}

export type AccessOptionType = ReturnType<
  typeof getLinkAccessRightOptions
>[number];
export type ShareOptionType = ReturnType<typeof getAccessTypeOptions>[number];
