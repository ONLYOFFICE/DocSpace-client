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

"use client";

import { EmployeeType } from "../enums";
import type { TTranslation } from "../types";

/** What a workspace user type can do - shown under the type in the user type
 * menus and as the type hint on the profile. */
export const getUserTypeDescriptionByType = (
  type: EmployeeType,
  t: TTranslation,
) => {
  switch (type) {
    case EmployeeType.Admin:
      return t("Common:RolePortalAdminDescription", {
        sectionName: t("Common:Files"),
        agentSection: t("Common:AIAgents"),
      });
    case EmployeeType.RoomAdmin:
      return t("Common:RoleRoomAdminDescription", {
        sectionName: t("Common:Files"),
        agentSection: t("Common:AIAgents"),
      });
    case EmployeeType.User:
      return t("Common:RoleNewUserDescription", {
        aiAgent: t("Common:AIAgent"),
        aiChats: t("Common:AIChats"),
      });
    case EmployeeType.Guest:
      return t("Common:RoleGuestDescription", {
        sectionName: t("Common:Files"),
      });
    default:
      return undefined;
  }
};

export const getUserTypeDescriptionClient = (
  isPortalAdmin: boolean,
  isRoomAdmin: boolean,
  isCollaborator: boolean,
  t: TTranslation,
) => {
  const type = isPortalAdmin
    ? EmployeeType.Admin
    : isRoomAdmin
      ? EmployeeType.RoomAdmin
      : isCollaborator
        ? EmployeeType.User
        : EmployeeType.Guest;

  return getUserTypeDescriptionByType(type, t);
};
