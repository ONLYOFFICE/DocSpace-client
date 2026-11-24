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


// CONTRACT TESTS: the Skill sets as the Files service answers them (the
// Instructions rooms of `files/rooms?searchArea=AiHub&type=10`, an opened set
// with its Markdown files, a skill's text at its `viewUrl`, and the rewrite
// and rename of a save). See privacyroom/__tests__/contract.test.ts for the
// rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import { aiSkillSetsHandlers, DOCUMENT_SUMMARY, skillSetsMock } from "../skillSets";

const PORT = "3303";
const API = `${BASE_URL}:${PORT}/${API_PREFIX}`;

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

type TListed = { title: string; filesCount: number; roomType: number };

const listSets = async (query: string) => {
  const res = await fetch(
    `${API}/files/rooms?searchArea=AiHub&type=10&${query}`,
  );
  const body = (await res.json()) as { response: { folders: TListed[] } };
  return body.response.folders;
};

describe("aiSkillSetsHandlers (mirrors the Files service's Instructions rooms)", () => {
  it("lists the sets with their skill counts, newest first by default", async () => {
    server.use(...aiSkillSetsHandlers(PORT, skillSetsMock()));

    const sets = await listSets("sortBy=DateAndTime&sortOrder=descending");
    expect(sets.map((s) => s.title)).toEqual([
      "Document assistant",
      "Legal tone",
      "Sales assistant",
    ]);
    expect(sets[0].filesCount).toBe(3);
    expect(sets.every((s) => s.roomType === 10)).toBe(true);
  });

  it("sorts the sets by their owners' names", async () => {
    server.use(...aiSkillSetsHandlers(PORT, skillSetsMock()));

    const sets = await listSets("sortBy=Author&sortOrder=ascending");
    expect(sets.map((s) => s.title)).toEqual([
      "Document assistant",
      "Sales assistant",
      "Legal tone",
    ]);
  });

  it("opens a set with its skills and serves a skill's text", async () => {
    const sets = skillSetsMock();
    server.use(...aiSkillSetsHandlers(PORT, sets));

    const res = await fetch(`${API}/files/${sets[0].id}`);
    const body = (await res.json()) as {
      response: {
        current: { roomType: number; isRoom: boolean };
        files: { title: string; folderId: number; viewUrl: string }[];
      };
    };
    expect(body.response.current).toMatchObject({ roomType: 10, isRoom: true });
    expect(body.response.files.map((f) => f.title)).toContain(
      DOCUMENT_SUMMARY.title,
    );
    expect(body.response.files[0].folderId).toBe(sets[0].id);

    const text = await (await fetch(body.response.files[0].viewUrl)).text();
    expect(text).toContain(`name: "${DOCUMENT_SUMMARY.name}"`);
    expect(text).toContain(DOCUMENT_SUMMARY.body.split("\n")[0]);
  });

  it("takes a rewritten skill as a new version and renames it", async () => {
    const sets = skillSetsMock();
    server.use(...aiSkillSetsHandlers(PORT, sets));
    const id = sets[0].skills[1].id;

    // The multipart body as the browser sends it (`updateFileStream`).
    const text = '---\nname: "risk-review"\n---\n\nReview the risks.\n';
    const update = await fetch(`${API}/files/${id}/update`, {
      method: "PUT",
      headers: { "Content-Type": "multipart/form-data; boundary=XyZ" },
      body: [
        "--XyZ",
        'Content-Disposition: form-data; name="file"; filename="Clause check.md"',
        "Content-Type: text/markdown",
        "",
        text,
        "--XyZ",
        'Content-Disposition: form-data; name="forcesave"',
        "",
        "true",
        "--XyZ--",
        "",
      ].join("\r\n"),
    });
    expect(update.status).toBe(200);
    expect(sets[0].skills[1].version).toBe(2);
    expect(sets[0].skills[1].text).toBe(text);

    const rename = await fetch(`${API}/files/file/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Risk review.md" }),
    });
    expect(rename.status).toBe(200);
    expect(sets[0].skills[1].title).toBe("Risk review.md");
  });

  it("refuses a rewritten skill with the Files service's message and keeps it", async () => {
    const sets = skillSetsMock();
    server.use(
      ...aiSkillSetsHandlers(PORT, sets, { refuseUpdate: "Bad frontmatter" }),
    );
    const before = sets[0].skills[0].text;

    const res = await fetch(`${API}/files/${sets[0].skills[0].id}/update`, {
      method: "PUT",
      headers: { "Content-Type": "multipart/form-data; boundary=XyZ" },
      body: "--XyZ--\r\n",
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { message: string } };
    expect(body.error.message).toBe("Bad frontmatter");
    expect(sets[0].skills[0].text).toBe(before);
  });
});
