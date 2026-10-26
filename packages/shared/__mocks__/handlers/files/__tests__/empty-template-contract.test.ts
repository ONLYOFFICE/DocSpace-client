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

// CONTRACT TESTS — lock the empty-template mock to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { emptyTemplateHandler } from "../emptyTemplate";
import { BASE_URL } from "../../../e2e/utils";

const PORT = "3500";

const server = setupServer(emptyTemplateHandler(PORT));

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

const getEmpty = (title: string) =>
  fetch(`${BASE_URL}:${PORT}/filehandler.ashx?action=empty&title=${title}`);

describe("emptyTemplateHandler (mirrors FileHandlerService.EmptyFile)", () => {
  it("streams the default template of the title's extension as an attachment", async () => {
    const res = await getEmpty(".docx");
    const bytes = new Uint8Array(await res.arrayBuffer());

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(res.headers.get("Content-Disposition")).toBe(
      "attachment; filename=new.docx",
    );
    expect(Number(res.headers.get("Content-Length"))).toBe(bytes.byteLength);
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });

  it("answers 404 for an extension without a template", async () => {
    const res = await getEmpty(".abc");

    expect(res.status).toBe(404);
  });
});
