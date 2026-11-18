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

import { getResponse, http, HttpResponse } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import {
  AI_HUB_ROOMS,
  AI_PROJECTS,
  aiHubRoomsHandler,
  type AiHubRoomMock,
  type AiProjectMock,
} from "./projects";

/**
 * `GET files/rooms?searchArea=AiHub` as a User reads it: the same list
 * (`aiHubRoomsHandler`), with a root that offers no `Create`. The server
 * lets everyone but a User create in the AI root (`FileSecurity`, the
 * `FolderType.AiHub` case: `!isUser` → `Create`), so a User is offered no
 * create control there. Any other search area is left to the rooms list
 * handler, as with `aiHubRoomsHandler`.
 */
export const aiHubRoomsAsUserHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
) => {
  const list = aiHubRoomsHandler(port, rooms, projects);
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms`,
    async ({ request }) => {
      const answer = await getResponse([list], request);
      if (!answer) return undefined;
      const body = (await answer.json()) as {
        response: { current: { security: Record<string, boolean> } };
      };
      body.response.current.security = {
        ...body.response.current.security,
        Create: false,
      };
      return HttpResponse.json(body);
    },
  );
};

const READ_DENIED = {
  error: {
    message: "You don't have enough permission to view the folder content",
  },
  status: 1,
  statusCode: 403,
};

/**
 * `GET files/:id` and `GET files/rooms/:id` for an agent the caller is not
 * a member of and may not see (a room admin outside it): the server refuses
 * to read the room (`ErrorMessage_SecurityException_ReadFolder`, 403). Only
 * a portal owner or DocSpace admin reads an agent they are not in; the
 * Agents list leaves such an agent out for anyone else, so it is not passed
 * to the list handlers. Any other id is left to the other handlers.
 */
export const aiAgentReadDeniedHandlers = (port: string, ids: number[]) => {
  const denied = ({ params }: { params: Record<string, unknown> }) =>
    ids.some((id) => String(id) === String(params.id))
      ? HttpResponse.json(READ_DENIED, { status: 403 })
      : undefined;
  return [
    http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id`, denied),
    http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/:id`, denied),
  ];
};

/** A portal account as the agent's invite panel finds it. */
export type AgentInviteAccount =
  | {
      id: string;
      displayName: string;
      email: string;
      type: "admin" | "roomAdmin" | "user" | "guest";
    }
  | { id: string; name: string; type: "group"; membersCount: number };

const AVATAR = "/static/images/default_user_photo_size_32-32.png";

/**
 * EmployeeFullDtoHelper.GetShareCandidateAsync for a user (the names, the
 * e-mail, the type flags, the states and `shared`), and GroupFullDtoHelper
 * for a group (`membersCount` is what the client tells a group by).
 */
const accountDto = (account: AgentInviteAccount) => {
  if (account.type === "group") {
    return {
      id: account.id,
      name: account.name,
      manager: null,
      isLDAP: false,
      membersCount: account.membersCount,
      shared: false,
    };
  }
  const [firstName, ...rest] = account.displayName.split(" ");
  return {
    id: account.id,
    displayName: account.displayName,
    firstName,
    lastName: rest.join(" "),
    email: account.email,
    userName: account.email.split("@")[0],
    status: 1,
    activationStatus: 1,
    isOwner: false,
    isAdmin: account.type === "admin",
    isRoomAdmin: account.type === "roomAdmin",
    isCollaborator: account.type === "user",
    isVisitor: account.type === "guest",
    isLDAP: false,
    isSSO: false,
    isAnonim: false,
    shared: false,
    hasAvatar: false,
    avatar: AVATAR,
    avatarOriginal: AVATAR,
    avatarMax: AVATAR,
    avatarMedium: AVATAR,
    avatarSmall: AVATAR,
    profileUrl: `${BASE_URL}/accounts/people/filter?search=${encodeURIComponent(account.email)}`,
    cultureName: "en-GB",
    department: "",
  };
};

const accountName = (account: AgentInviteAccount) =>
  account.type === "group" ? account.name : account.displayName;

/**
 * `GET accounts/room/{id}/search` for an agent
 * (AccountsController.GetAccountsEntriesWithRoomsShared): the users and
 * groups matching `filterValue` by name or e-mail, ignoring case, groups
 * first, as a counted list; an empty search answers an empty list. The
 * server answers guests and groups for an agent as for any room: it is the
 * invite panel that leaves them out. Any other room is left to the other
 * handlers.
 */
export const agentInviteSearchHandler = (
  port: string,
  agentId: number,
  accounts: AgentInviteAccount[],
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/accounts/room/:id/search`,
    ({ params, request }) => {
      if (String(params.id) !== String(agentId)) return undefined;
      // The client sends `filtervalue`; the server binds it case-insensitively.
      const { searchParams } = new URL(request.url);
      const query = (
        searchParams.get("filtervalue") ??
        searchParams.get("filterValue") ??
        ""
      )
        .trim()
        .toLowerCase();
      const matches = query
        ? accounts.filter(
            (account) =>
              accountName(account).toLowerCase().includes(query) ||
              (account.type !== "group" &&
                account.email.toLowerCase().includes(query)),
          )
        : [];
      const ordered = [
        ...matches.filter((account) => account.type === "group"),
        ...matches.filter((account) => account.type !== "group"),
      ];
      return HttpResponse.json({
        response: ordered.map(accountDto),
        count: ordered.length,
        total: ordered.length,
        status: 0,
        statusCode: 200,
      });
    },
  );
