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

import { describe, it, expect, beforeEach } from "vitest";

import {
  getRotationState,
  setRotationState,
  clearRotationState,
  type RotationState,
} from "../rotation-state";

const USER_A = "user-a";
const USER_B = "user-b";

const sample: RotationState = {
  oldKeyId: "old-key",
  newKeyId: "new-key",
  newPublicKeyId: "new-key",
  startedAt: 1000,
  roomsTotal: 3,
  roomsDone: 1,
  failedRoomIds: [42],
};

describe("rotation-state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a checkpoint per user", () => {
    setRotationState(USER_A, sample);
    expect(getRotationState(USER_A)).toEqual(sample);
    expect(getRotationState(USER_B)).toBeNull();
  });

  it("clear removes only the given user's record", () => {
    setRotationState(USER_A, sample);
    setRotationState(USER_B, { ...sample, oldKeyId: "other" });
    clearRotationState(USER_A);
    expect(getRotationState(USER_A)).toBeNull();
    expect(getRotationState(USER_B)).not.toBeNull();
  });

  it("returns null for undefined userId and for corrupt records", () => {
    expect(getRotationState(undefined)).toBeNull();
    localStorage.setItem("encryption-rotation-state:user-a", "{not json");
    expect(getRotationState(USER_A)).toBeNull();
    localStorage.setItem(
      "encryption-rotation-state:user-a",
      JSON.stringify({ oldKeyId: 5 }),
    );
    expect(getRotationState(USER_A)).toBeNull();
  });

  it("set/clear are no-ops without a userId", () => {
    setRotationState(undefined, sample);
    clearRotationState(undefined);
    expect(getRotationState(USER_A)).toBeNull();
  });
});
