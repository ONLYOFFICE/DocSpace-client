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

import { TUser, TUserGroup } from "@docspace/shared/api/people/types";
import { EmployeeStatus, EmployeeType } from "@docspace/shared/enums";
import { TCreatedBy } from "@docspace/shared/types";

export type TContactsSelected =
  | "all"
  | "active"
  | "pending"
  | "disabled"
  | "none"
  | "close";

export type TContactsTab =
  | "people"
  | "groups"
  | "inside_group"
  | "guests"
  | false;

export type TContactsViewAs = "table" | "row";

export type TContactsMenuItemdId = "active" | "pending" | "disabled" | "all";

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
  groups: TUserGroup[] | undefined;
  position: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  isSSO: boolean;
  isLDAP: boolean;
  quotaLimit: number | undefined;
  usedSpace: number | undefined;
  isCustomQuota: boolean | string | undefined;
  createdBy: TCreatedBy | undefined;
  registrationDate: string | undefined;
  tfaAppEnabled: boolean | undefined;
};

export type TChangeUserTypeDialogData = {
  toType: EmployeeType;
  fromType: EmployeeType[];
  userIDs: string[];
  userNames: string[];
  user?: {
    id: string;
    status: EmployeeStatus;
    activationStatus: number;
    statusType: string;
    role: EmployeeType;
    displayName?: string;
  };
  successCallback?: (users?: TUser[]) => void;
  abortCallback?: VoidFunction;
  getReassignmentProgress?: () => Promise<number>;
  reassignUserData?: boolean;
  cancelReassignment?: VoidFunction;
  showDeleteProfileCheckbox?: boolean;
  needReassignData?: boolean;
  noRoomFilesToMove?: boolean;
};

export type TChangeUserStatusDialogData = {
  userIDs: string[];
  status: EmployeeStatus;
  isGuests: boolean;
};
