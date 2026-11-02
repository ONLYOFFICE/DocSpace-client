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

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useUndoHistory } from "../hooks/useUndoHistory";

const setup = () => renderHook(() => useUndoHistory<number>()).result.current;

describe("useUndoHistory", () => {
  it("gives the steps back from the latest one", () => {
    const history = setup();

    history.record(1);
    history.record(2);

    expect(history.undo(3)).toBe(2);
    expect(history.undo(2)).toBe(1);
    expect(history.undo(1)).toBeUndefined();
  });

  it("redoes what was undone, in order", () => {
    const history = setup();

    history.record(1);
    history.record(2);

    expect(history.undo(3)).toBe(2);
    expect(history.undo(2)).toBe(1);
    expect(history.redo(1)).toBe(2);
    expect(history.redo(2)).toBe(3);
    expect(history.redo(3)).toBeUndefined();
  });

  it("drops the redo steps once a new change is made", () => {
    const history = setup();

    history.record(1);
    history.undo(2);
    history.record(1);

    expect(history.redo(5)).toBeUndefined();
  });

  it("keeps one step for a run of edits to the same field", () => {
    const history = setup();

    history.record(1, "field:12");
    history.record(2, "field:12");
    history.record(3, "field:15");

    expect(history.undo(4)).toBe(3);
    expect(history.undo(3)).toBe(1);
  });

  it("starts a new step for the same field after an undo", () => {
    const history = setup();

    history.record(1, "field:12");
    history.undo(2);
    history.record(1, "field:12");

    expect(history.undo(3)).toBe(1);
    expect(history.undo(1)).toBeUndefined();
  });

  it("forgets every step on reset", () => {
    const history = setup();

    history.record(1);
    history.undo(2);
    history.reset();

    expect(history.undo(1)).toBeUndefined();
    expect(history.redo(1)).toBeUndefined();
  });
});
