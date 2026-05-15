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

import type { ThemeKeys } from "@docspace/ui-kit/enums";
import type {
  EmployeeActivationStatus,
  EmployeeStatus,
  EmployeeType,
} from "../../enums";
import type { TCreatedBy } from "../../types";

export type TFilterSortBy =
  | "AZ"
  | "displayname"
  | "type"
  | "department"
  | "email"
  | "usedspace"
  | "registrationDate"
  | "createdby";

export type TFilterArea = "all" | "people" | "guests";

export type TSortOrder = "descending" | "ascending";

export type TUserGroup = {
  id: string;
  manager: string;
  name: string;
};

export type TUser = {
  access: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  status: EmployeeStatus;
  activationStatus: EmployeeActivationStatus;
  department: string;
  workFrom: string;
  avatarMax: string;
  avatarMedium: string;
  avatarOriginal: string;
  avatar: string;
  isAdmin: boolean;
  isRoomAdmin: boolean;
  isLDAP: boolean;
  listAdminModules: string[];
  isOwner: boolean;
  isVisitor: boolean;
  isCollaborator: boolean;
  mobilePhoneActivationStatus: number;
  isSSO: boolean;
  quotaLimit?: number;
  usedSpace?: number;
  id: string;
  displayName: string;
  avatarSmall: string;
  profileUrl: string;
  hasAvatar: boolean;
  theme?: ThemeKeys;
  mobilePhone?: string;
  cultureName?: string;
  groups?: TUserGroup[];
  shared?: boolean;
  loginEventId?: number;
  notes?: string;
  isCustomQuota?: string;
  title?: string;
  registrationDate?: string;
  createdBy?: TCreatedBy;
  hasPersonalFolder?: boolean;
  isAnonim: boolean;
  tfaAppEnabled?: boolean;
  sharedTo?: object;
};

export type TGetUserList = {
  items: TUser[];
  total: number;
};

export type TChangeTheme = {
  theme: ThemeKeys;
};

export type TPeopleListItem = {
  id: string;
  status: EmployeeStatus;
  activationStatus: number;
  statusType: string;
  role: EmployeeType;
  isOwner: boolean;
  isAdmin: boolean;
  isCollaborator: boolean;
  isRoomAdmin: boolean;
  isVisitor: boolean;
  displayName: string;
  avatar: string;
  avatarMax: string | undefined;
  hasAvatar: boolean;
  email: string;
  userName: string;
  mobilePhone: string | undefined;
  options: string[] | undefined;
  // groups: any[] | undefined; // TODO: fix type
  position: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  isSSO: boolean;
  isLDAP: boolean;
  quotaLimit: number | undefined;
  usedSpace: number | undefined;
  isCustomQuota: boolean | string | undefined;
  // createdBy: any; // TODO: fix type
  registrationDate: string | undefined;
  tfaAppEnabled: boolean | undefined;
};
