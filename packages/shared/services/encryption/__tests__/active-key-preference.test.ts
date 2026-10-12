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

import {
  clearActiveKeyId,
  getActiveKeyId,
  selectActiveKey,
  setActiveKeyId,
} from "../active-key-preference";

beforeEach(() => {
  localStorage.clear();
});

describe("get/setActiveKeyId — scoped by userId", () => {
  it("returns null when nothing was stored", () => {
    expect(getActiveKeyId("u1")).toBeNull();
  });

  it("round-trips a set value", () => {
    setActiveKeyId("u1", "key-a");
    expect(getActiveKeyId("u1")).toBe("key-a");
  });

  it("keeps separate slots per userId so logins don't collide", () => {
    setActiveKeyId("u1", "alice-key");
    setActiveKeyId("u2", "bob-key");
    expect(getActiveKeyId("u1")).toBe("alice-key");
    expect(getActiveKeyId("u2")).toBe("bob-key");
  });

  it("clearActiveKeyId removes only the targeted user's entry", () => {
    setActiveKeyId("u1", "k1");
    setActiveKeyId("u2", "k2");
    clearActiveKeyId("u1");
    expect(getActiveKeyId("u1")).toBeNull();
    expect(getActiveKeyId("u2")).toBe("k2");
  });

  it("treats undefined userId as a no-op", () => {
    setActiveKeyId(undefined, "ignored");
    expect(getActiveKeyId(undefined)).toBeNull();
  });
});

describe("selectActiveKey — multi-key picking logic", () => {
  const A = { id: "a", publicKey: "pk-a" };
  const B = { id: "b", publicKey: "pk-b" };
  const C = { id: "c", publicKey: "pk-c" };

  it("returns null for an empty or missing list", () => {
    expect(selectActiveKey([], "anything")).toBeNull();
    expect(selectActiveKey(null, "anything")).toBeNull();
    expect(selectActiveKey(undefined, "anything")).toBeNull();
  });

  it("picks the single key even when preferred is unset (legacy single-device)", () => {
    expect(selectActiveKey([A], null)).toBe(A);
    expect(selectActiveKey([A], undefined)).toBe(A);
  });

  it("picks the preferred key when it exists in the list", () => {
    expect(selectActiveKey([A, B, C], "b")).toBe(B);
  });

  it("returns null when preferred is unset AND the list has 2+ keys — user must pick", () => {
    expect(selectActiveKey([A, B], null)).toBeNull();
    expect(selectActiveKey([A, B, C], undefined)).toBeNull();
  });

  it("returns null when preferred references a key that no longer exists", () => {
    expect(selectActiveKey([A, B], "ghost")).toBeNull();
  });
});
