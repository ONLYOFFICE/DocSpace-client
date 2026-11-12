/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import { folderHistoryHandler } from "../folderHistory";

const PORT = "3204";
const ROOM_ID = 9800;

const server = setupServer(
  folderHistoryHandler(PORT, ROOM_ID, {
    feeds: [
      { id: 1, date: "2026-11-05T10:00:00.000Z", title: "a1b2c3.docx" },
      {
        id: 2,
        date: "2026-11-05T11:00:00.000Z",
        title: "a1b2c3.docx",
        action: "FileKeysSet",
      },
    ],
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("folderHistory mock — GET /files/folder/{id}/log (mirrors HistoryService.TrackedActions)", () => {
  it("History read: a key write is listed as FileKeysSet with the actor and no recipient", async () => {
    const res = await fetch(
      `${BASE_URL}:${PORT}/${API_PREFIX}/files/folder/${ROOM_ID}/log`,
    );
    const { response } = (await res.json()) as {
      response: {
        id: number;
        action: { id: number; key: string };
        initiator: { id: string };
        data: Record<string, unknown>;
      }[];
    };

    expect(response.map((feed) => feed.action)).toEqual([
      { id: 5164, key: "FileKeysSet" },
      { id: 5000, key: "FileCreated" },
    ]);
    expect(response[0].initiator.id).toBeTruthy();
    expect(response[0].data).not.toHaveProperty("recipients");
  });
});
