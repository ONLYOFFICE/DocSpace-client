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

// CONTRACT TESTS: what the chat panel's agent menu calls besides the projects
// list - an Instructions or Knowledge room read with the caller's rights
// before it is linked to a new agent (`files/rooms/{id}`), and an agent
// deleted through a queued operation (`DELETE files/rooms/{id}`, then
// `files/fileops?id=`). See privacyroom/__tests__/contract.test.ts for the
// rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import {
  AI_HUB_ROOMS,
  AI_PROJECTS,
  AiProjectMockAccess,
  aiHubRoomAsReader,
  aiHubRoomGetByIdHandler,
  aiProjectDeleteHandlers,
  aiProjectMock,
} from "../projects";

const PORT = "3303";
const API = `${BASE_URL}:${PORT}/${API_PREFIX}`;

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

type TRoomAnswer = { response: { id: number; security: { EditRoom: boolean } } };
type TOperationAnswer = { id: string; finished: boolean; error: string; Operation: number };

describe("aiHubRoomGetByIdHandler (mirrors GET files/rooms/{id} for an AI room)", () => {
  const [room, other] = AI_HUB_ROOMS;

  it("answers the room with the caller's rights", async () => {
    server.use(aiHubRoomGetByIdHandler(PORT, [room, aiHubRoomAsReader(other)]));

    const owned = (await (await fetch(`${API}/files/rooms/${room.id}`)).json()) as TRoomAnswer;
    expect(owned.response.id).toBe(room.id);
    expect(owned.response.security.EditRoom).toBe(true);

    const read = (await (await fetch(`${API}/files/rooms/${other.id}`)).json()) as TRoomAnswer;
    expect(read.response.security.EditRoom).toBe(false);
  });

  it("leaves any other room to the other handlers", async () => {
    server.use(aiHubRoomGetByIdHandler(PORT, [room]));

    await expect(fetch(`${API}/files/rooms/1`)).rejects.toThrow();
  });
});

describe("aiProjectDeleteHandlers (mirrors VirtualRoomsController.DeleteRoom and the operations list)", () => {
  it("queues the delete, and the operations list finishes it and drops the agent", async () => {
    const projects = [...AI_PROJECTS];
    const [agent] = projects;
    server.use(...aiProjectDeleteHandlers(PORT, projects));

    const deleted = await fetch(`${API}/files/rooms/${agent.id}`, {
      method: "DELETE",
      body: JSON.stringify({ deleteAfter: false }),
    });
    expect(deleted.status).toBe(200);
    const queued = ((await deleted.json()) as { response: TOperationAnswer }).response;
    expect(queued.finished).toBe(false);
    expect(queued.Operation).toBe(2);
    // Still listed until the operation ends.
    expect(projects).toContain(agent);

    const progress = (await (
      await fetch(`${API}/files/fileops?id=${queued.id}`)
    ).json()) as { response: TOperationAnswer[] };
    expect(progress.response).toHaveLength(1);
    expect(progress.response[0]).toMatchObject({ id: queued.id, finished: true, error: "" });
    expect(projects).not.toContain(agent);
  });

  it("answers 403 to a caller who may not delete the agent", async () => {
    const member = aiProjectMock({
      id: 777900,
      title: "Shared",
      color: "5CC5D4",
      access: AiProjectMockAccess.Member,
    });
    server.use(...aiProjectDeleteHandlers(PORT, [member]));

    const res = await fetch(`${API}/files/rooms/${member.id}`, { method: "DELETE" });
    expect(res.status).toBe(403);
  });
});
