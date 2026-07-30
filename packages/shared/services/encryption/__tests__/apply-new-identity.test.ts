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

import { describe, it, expect, beforeEach, vi } from "vitest";

const acceptKeyMock = vi.fn();
vi.mock("../tofu-store", () => ({
  getTofuStore: () => ({ acceptKey: acceptKeyMock }),
}));
vi.mock("../active-key-preference", () => ({
  setActiveKeyId: vi.fn(),
}));
vi.mock("../secret-storage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn() },
}));

import { setActiveKeyId } from "../active-key-preference";
import { SecretStorage } from "../secret-storage";
import { applyNewIdentity } from "../apply-new-identity";
import type { IdentityKeyPair } from "../types";

const USER = "11111111-1111-1111-1111-111111111111";
const KEY_ID = "aaaaaaaa-0000-0000-0000-00000000000a";

const newIdentity = {
  publicKey: new Uint8Array(32).fill(1),
  privateKey: new Uint8Array(32).fill(2),
} as IdentityKeyPair;

describe("applyNewIdentity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pins the new key for proof-of-possession but does NOT activate when activate=false", async () => {
    await applyNewIdentity({
      userId: USER,
      newIdentity,
      newPublicKeyB64: "pub-b64",
      newPublicKeyId: KEY_ID,
      activate: false,
    });

    expect(acceptKeyMock).toHaveBeenCalledWith(USER, "pub-b64");
    expect(setActiveKeyId).not.toHaveBeenCalled();
    expect(SecretStorage.cacheUnlocked).not.toHaveBeenCalled();
  });

  it("activates the new key in the zero-keys bootstrap case (activate=true)", async () => {
    await applyNewIdentity({
      userId: USER,
      newIdentity,
      newPublicKeyB64: "pub-b64",
      newPublicKeyId: KEY_ID,
      activate: true,
    });

    expect(acceptKeyMock).toHaveBeenCalledWith(USER, "pub-b64");
    expect(setActiveKeyId).toHaveBeenCalledWith(USER, KEY_ID);
    expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(USER, newIdentity);
  });
});
