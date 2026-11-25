// (c) Copyright Ascensio System SIA 2009-2026
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

import { http, HttpResponse } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

import type { AiProjectMock } from "./projects";

/** FileShare.None: the access a member who leaves is given. */
const SHARE_NONE = 0;

const findIndex = (projects: AiProjectMock[], id: unknown) =>
  projects.findIndex((project) => String(project.id) === String(id));

/**
 * `PUT files/rooms/:id/share` for an agent, as Leave agent sends it: the
 * caller's own invitation set to `None` drops their share
 * (VirtualRoomsController.SetRoomSecurity), so the agent leaves `projects`
 * and the Agents list no longer lists it to them. Answers the room's
 * `RoomSecurityDto` with nobody left to list. A request that is not the
 * caller leaving an agent of the list is left to the room members handlers.
 */
export const aiAgentLeaveHandler = (
  port: string,
  projects: AiProjectMock[],
  userId: string,
) =>
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/share`,
    async ({ params, request }) => {
      const index = findIndex(projects, params.id);
      if (index < 0) return undefined;
      const body = (await request.clone().json()) as {
        invitations?: { id?: string; access?: number }[];
      };
      const leaves = (body.invitations ?? []).some(
        (invitation) =>
          invitation.id === userId && invitation.access === SHARE_NONE,
      );
      if (!leaves) return undefined;
      projects.splice(index, 1);
      return HttpResponse.json({ response: { members: [] } });
    },
  );

/**
 * `PUT files/fileops/delete` for agents, as Delete agent sends it: an agent
 * is a room, deleted outright, and the list no longer has it
 * (OperationController, "fileops/delete"). Answers one operation that is
 * already finished (FileOperationType.Delete = 2,
 * DistributedTaskStatus.Completed = 2), so the client does not poll
 * `fileops`, as `files/encryptedFiles.ts` answers a delete. A request that
 * names no agent of the list is left to the other handlers.
 */
export const aiAgentDeleteHandler = (port: string, projects: AiProjectMock[]) =>
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/files/fileops/delete`,
    async ({ request }) => {
      const body = (await request.clone().json()) as {
        folderIds?: (number | string)[];
      };
      const ids = (body.folderIds ?? []).filter(
        (id) => findIndex(projects, id) >= 0,
      );
      if (ids.length === 0) return undefined;
      for (const id of ids) projects.splice(findIndex(projects, id), 1);
      return HttpResponse.json({
        response: [
          {
            id: "mock-delete-agent",
            Operation: 2,
            progress: 100,
            error: "",
            processed: String(ids.length),
            finished: true,
            status: 2,
          },
        ],
      });
    },
  );

/**
 * `GET files/rooms/:id/skills` refused, as the server refuses the skills of
 * an agent the caller may no longer read (403, AiHubController): the
 * agent's Context lists its skill sets without their skills.
 */
export const aiAgentSkillsRefusedHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/skills`, () =>
    HttpResponse.json(
      { error: { message: "Access denied" } },
      { status: 403 },
    ),
  );
