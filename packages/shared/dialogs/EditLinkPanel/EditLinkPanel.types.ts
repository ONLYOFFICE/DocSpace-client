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
  isExternalShareRestricted?: boolean;
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
