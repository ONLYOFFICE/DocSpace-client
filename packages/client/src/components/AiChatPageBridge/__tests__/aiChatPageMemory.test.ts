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

import { beforeEach, describe, expect, it } from "vitest";

import { readAiChatPage, writeAiChatPage } from "../aiChatPageMemory";

describe("AI chat page memory", () => {
  beforeEach(() => sessionStorage.clear());

  it("remembers the page and its conversation per user", () => {
    writeAiChatPage("u1", { page: "chat", threadId: "t1" });
    expect(readAiChatPage("u1")).toEqual({ page: "chat", threadId: "t1" });
    expect(readAiChatPage("u2")).toBeNull();
  });

  it("remembers the history without a conversation", () => {
    writeAiChatPage("u1", { page: "history" });
    expect(readAiChatPage("u1")).toEqual({ page: "history" });
  });

  it("forgets the chat once it is closed", () => {
    writeAiChatPage("u1", { page: "chat" });
    writeAiChatPage("u1", null);
    expect(readAiChatPage("u1")).toBeNull();
  });

  it("remembers nothing for an anonymous session", () => {
    writeAiChatPage(undefined, { page: "chat" });
    expect(sessionStorage.length).toBe(0);
    expect(readAiChatPage(undefined)).toBeNull();
  });

  it("drops a record it cannot read", () => {
    sessionStorage.setItem("aiChatPage:u1", "{not json");
    expect(readAiChatPage("u1")).toBeNull();
    sessionStorage.setItem("aiChatPage:u1", JSON.stringify({ page: "settings" }));
    expect(readAiChatPage("u1")).toBeNull();
    sessionStorage.setItem("aiChatPage:u1", JSON.stringify({ page: "chat", threadId: 5 }));
    expect(readAiChatPage("u1")).toEqual({ page: "chat" });
  });
});
