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

// CONTRACT TESTS: what the server answers about an agent by who asks - the
// AI root's `Create` for a User, a read refused to a room admin outside the
// agent, and the account search of the agent's invite panel. See
// privacyroom/__tests__/contract.test.ts for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import {
  aiAgentReadDeniedHandlers,
  aiHubRoomsAsUserHandler,
  agentInviteSearchHandler,
  type AgentInviteAccount,
} from "../agentAccess";
import { AI_PROJECTS, aiHubRoomsHandler } from "../projects";

const PORT = "3303";
const api = (path: string) => `${BASE_URL}:${PORT}/${API_PREFIX}/${path}`;

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

type ListBody = {
  response: {
    current: { security: Record<string, boolean> };
    folders: { id: number }[];
  };
};

describe("aiHubRoomsAsUserHandler (the AI root as a User reads it)", () => {
  it("answers the same list with a root that offers no Create", async () => {
    server.use(aiHubRoomsAsUserHandler(PORT));

    const res = await fetch(api("files/rooms?searchArea=AiHub&type=12"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ListBody;
    expect(body.response.current.security.Create).toBe(false);
    expect(body.response.current.security.Read).toBe(true);
    expect(body.response.folders.map((f) => f.id)).toEqual(
      AI_PROJECTS.map((p) => p.id),
    );
  });

  it("leaves the root's Create to everyone else", async () => {
    server.use(aiHubRoomsHandler(PORT));

    const body = (await (
      await fetch(api("files/rooms?searchArea=AiHub&type=12"))
    ).json()) as ListBody;
    expect(body.response.current.security.Create).toBe(true);
  });
});

describe("aiAgentReadDeniedHandlers (an agent the caller may not read)", () => {
  it("refuses the room and its content with 403", async () => {
    server.use(...aiAgentReadDeniedHandlers(PORT, [777900]));

    for (const path of ["files/rooms/777900", "files/777900"]) {
      const res = await fetch(api(path));
      expect(res.status).toBe(403);
      const body = (await res.json()) as { error: { message: string } };
      expect(body.error.message).toBe(
        "You don't have enough permission to view the folder content",
      );
    }
  });
});

describe("agentInviteSearchHandler (AccountsController.GetAccountsEntriesWithRoomsShared)", () => {
  const ACCOUNTS: AgentInviteAccount[] = [
    { id: "u-1", displayName: "Rita Stone", email: "rita@example.com", type: "roomAdmin" },
    { id: "u-2", displayName: "Uma Stone", email: "uma@example.com", type: "user" },
    { id: "u-3", displayName: "Gina Guest", email: "gina@example.com", type: "guest" },
    { id: "g-1", name: "Stone team", type: "group", membersCount: 2 },
  ];

  const search = (value: string, id = 777001) =>
    fetch(
      api(
        `accounts/room/${id}/search?filterValue=${encodeURIComponent(value)}&filterSeparator=,`,
      ),
    );

  it("answers the matches, groups first, with the user's type flags", async () => {
    server.use(agentInviteSearchHandler(PORT, 777001, ACCOUNTS));

    const body = (await (await search("stone")).json()) as {
      response: Record<string, unknown>[];
      total: number;
    };
    expect(body.total).toBe(3);
    expect(body.response.map((a) => a.id)).toEqual(["g-1", "u-1", "u-2"]);
    expect(body.response[0].membersCount).toBe(2);
    expect(body.response[1].isRoomAdmin).toBe(true);
    expect(body.response[2].isCollaborator).toBe(true);
  });

  it("finds a guest by e-mail and answers nothing to an empty search", async () => {
    server.use(agentInviteSearchHandler(PORT, 777001, ACCOUNTS));

    const guest = (await (await search("gina@")).json()) as {
      response: Record<string, unknown>[];
    };
    expect(guest.response).toHaveLength(1);
    expect(guest.response[0].isVisitor).toBe(true);

    const empty = (await (await search("")).json()) as { total: number };
    expect(empty.total).toBe(0);
  });
});
