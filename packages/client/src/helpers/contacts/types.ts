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
