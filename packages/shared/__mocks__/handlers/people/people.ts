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

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

import { EmployeeStatus, EmployeeType } from "../../../enums";

export const PATH = "people/filter*";

export const successPeople = {
  items: [
    {
      id: "user-1",
      displayName: "John Smith",
      email: "john.smith@example.com",
      isOwner: true,
      isAdmin: false,
      isVisitor: false,
      isCollaborator: false,
      isRoomAdmin: false,
      avatar: "",
      role: "admin",
      hasAvatar: false,
      userType: EmployeeType.Admin,
      status: EmployeeStatus.Active,
    },
    {
      id: "user-2",
      displayName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      isOwner: false,
      isAdmin: false,
      isVisitor: false,
      isCollaborator: true,
      isRoomAdmin: false,
      avatar: "",
      role: "collaborator",
      hasAvatar: false,
      userType: EmployeeType.User,
      status: EmployeeStatus.Active,
    },
    {
      id: "user-3",
      displayName: "Michael Brown",
      email: "michael.brown@example.com",
      isOwner: false,
      isAdmin: false,
      isVisitor: false,
      isCollaborator: true,
      isRoomAdmin: false,
      avatar: "",
      role: "collaborator",
      hasAvatar: false,
      userType: EmployeeType.User,
      status: EmployeeStatus.Active,
    },
    {
      id: "user-4",
      displayName: "Emily Davis",
      email: "emily.davis@example.com",
      isOwner: false,
      isAdmin: false,
      isVisitor: true,
      isCollaborator: false,
      isRoomAdmin: false,
      avatar: "",
      role: "guest",
      hasAvatar: false,
      userType: EmployeeType.Guest,
      status: EmployeeStatus.Active,
    },
    {
      id: "user-5",
      displayName: "David Wilson",
      email: "david.wilson@example.com",
      isOwner: false,
      isAdmin: true,
      isVisitor: false,
      isCollaborator: false,
      isRoomAdmin: true,
      avatar: "",
      role: "admin",
      hasAvatar: false,
      userType: EmployeeType.Admin,
      status: EmployeeStatus.Active,
    },
  ],
  count: 5,
  links: [
    {
      href: `/${API_PREFIX}/${PATH}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const peopleResolver = (): Response => {
  return new Response(JSON.stringify({ response: successPeople }));
};

export const peopleHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(`${baseUrl}/${API_PREFIX}/${PATH}`, () => {
    return peopleResolver();
  });
};
