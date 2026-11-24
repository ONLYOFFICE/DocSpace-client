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

// CONTRACT TESTS: the files of a conversation as the Files service answers
// them (`files/rooms/{id}/threads/{threadId}/artifacts|attachments`, a
// counted list, 404 once the conversation is deleted). See
// privacyroom/__tests__/contract.test.ts for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import { AI_PROJECT_WITH_SOURCES, aiThreadFilesHandlers } from "../projects";

const PORT = "3302";
const AGENT = AI_PROJECT_WITH_SOURCES.id;

const read = (agentId: number, threadId: string, kind: string) =>
  fetch(
    `${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms/${agentId}/threads/${threadId}/${kind}?sortBy=DateAndTime&sortOrder=descending`,
  );

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("aiThreadFilesHandlers (mirrors the Files service's thread file lists)", () => {
  const threads = {
    "thr-1": {
      artifacts: [{ id: 1, title: "Chart.png", fileExst: ".png" }],
      attachments: [
        { id: 2, title: "Brief.docx", fileExst: ".docx" },
        { id: 3, title: "Data.xlsx", fileExst: ".xlsx" },
      ],
    },
  };

  it("answers each list of a conversation as a counted list", async () => {
    server.use(...aiThreadFilesHandlers(PORT, undefined, threads));

    const artifacts = await read(AGENT, "thr-1", "artifacts");
    expect(artifacts.status).toBe(200);
    const body = (await artifacts.json()) as {
      response: { id: number; folderId: number }[];
      total: number;
    };
    expect(body.total).toBe(1);
    expect(body.response.map((f) => f.id)).toEqual([1]);
    expect(body.response[0].folderId).toBe(AGENT);

    const attachments = (await (
      await read(AGENT, "thr-1", "attachments")
    ).json()) as { response: { id: number }[]; total: number };
    expect(attachments.total).toBe(2);
    expect(attachments.response.map((f) => f.id)).toEqual([2, 3]);
  });

  it("answers empty lists for a conversation with no files yet", async () => {
    server.use(...aiThreadFilesHandlers(PORT, undefined, threads));

    const body = (await (await read(AGENT, "thr-new", "artifacts")).json()) as {
      response: unknown[];
      total: number;
    };
    expect(body.total).toBe(0);
    expect(body.response).toEqual([]);
  });

  it("answers 404 for a deleted conversation", async () => {
    server.use(...aiThreadFilesHandlers(PORT, undefined, threads, ["thr-1"]));

    expect((await read(AGENT, "thr-1", "artifacts")).status).toBe(404);
    expect((await read(AGENT, "thr-1", "attachments")).status).toBe(404);
  });

  it("answers 404 for an unknown agent", async () => {
    server.use(...aiThreadFilesHandlers(PORT, undefined, threads));

    expect((await read(1, "thr-1", "artifacts")).status).toBe(404);
  });
});
