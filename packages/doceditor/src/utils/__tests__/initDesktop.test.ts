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

import { describe, expect, it, vi } from "vitest";

import type { TUser } from "@docspace/shared/api/people/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

const mocks = vi.hoisted(() => ({ regDesktop: vi.fn() }));

vi.mock("@docspace/shared/utils/desktop", () => ({
  regDesktop: mocks.regDesktop,
}));

vi.mock("@docspace/shared/api/files", () => ({
  setEncryptionKeys: vi.fn(),
  getEncryptionAccess: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

import initDesktop from "../initDesktop";

const user = { id: "user-1" } as TUser;

const pair = (id: string, date: string): TEncryptionKeyPair => ({
  id,
  userId: "user-1",
  publicKey: `public-${id}`,
  privateKeyEnc: `sealed-${id}`,
  date,
  cryptoEngineId: `engine-${id}`,
});

/** What regDesktop was given: whether encryption is on, and the key pair. */
const registered = () => {
  const [, isEncryption, keys] = mocks.regDesktop.mock.calls[0];
  return { isEncryption, keys };
};

describe("initDesktop", () => {
  it("Desktop key pair comes from the loaded key set", () => {
    initDesktop(
      [pair("old", "2026-01-01T00:00:00Z"), pair("new", "2026-06-01T00:00:00Z")],
      user,
      7,
      null,
    );

    expect(registered()).toEqual({
      isEncryption: true,
      keys: {
        publicKey: "public-new",
        privateKeyEnc: "sealed-new",
        cryptoEngineId: "engine-new",
      },
    });
  });

  it.each([
    ["an empty key set", []],
    ["a key set that was not read", null],
  ])("registers the desktop without a key pair for %s", (_, loadedKeys) => {
    initDesktop(loadedKeys, user, 7, null);

    expect(registered()).toEqual({ isEncryption: false, keys: undefined });
  });
});
