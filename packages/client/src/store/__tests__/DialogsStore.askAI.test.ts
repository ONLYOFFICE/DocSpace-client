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

import { describe, it, expect } from "vitest";

import type { TFile } from "@docspace/shared/api/files/types";

import DialogsStore from "../DialogsStore";

const createStore = () =>
  new DialogsStore(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

describe("DialogsStore — Ask AI request", () => {
  it("consumeAskAIFile returns the requested file once and then null", () => {
    const store = createStore();
    const file = { id: 1, title: "doc.docx" } as TFile;

    expect(store.askAIFile).toBeNull();

    store.setAskAIFile(file);
    // MobX wraps the stored object in an observable proxy, so compare by value.
    expect(store.askAIFile).toEqual(file);

    expect(store.consumeAskAIFile()).toEqual({ file, analyze: false });
    expect(store.askAIFile).toBeNull();
    expect(store.consumeAskAIFile()).toEqual({ file: null, analyze: false });
  });

  // "Analyze responses" attaches the form as the subject of the message, so
  // the intent has to survive the hop through the store.
  it("keeps the analyze intent alongside the file, and clears it too", () => {
    const store = createStore();
    const file = { id: 1, title: "survey.pdf" } as TFile;

    store.setAskAIFile(file, true);
    expect(store.askAIAnalyze).toBe(true);
    expect(store.consumeAskAIFile()).toEqual({ file, analyze: true });
    expect(store.askAIAnalyze).toBe(false);

    // A plain "Ask AI" after it must not inherit the flag.
    store.setAskAIFile(file);
    expect(store.consumeAskAIFile()).toEqual({ file, analyze: false });
  });
});
