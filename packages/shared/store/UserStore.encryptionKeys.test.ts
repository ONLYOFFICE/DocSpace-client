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

import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ getEncryptionKeys: vi.fn() }));

vi.mock("../api", () => ({
  default: { privacy: { getEncryptionKeys: api.getEncryptionKeys } },
}));

import { UserStore } from "./UserStore";

const KEY = { id: "key-1", publicKey: "pub", privateKeyEnc: "enc" };

describe("UserStore.ensureEncryptionKeys", () => {
  let store: UserStore;

  beforeEach(() => {
    store = new UserStore();
  });

  it("known list", async () => {
    store.setUserEncryptionKeys([KEY] as never);

    expect(await store.ensureEncryptionKeys()).toEqual([KEY]);
    expect(api.getEncryptionKeys).not.toHaveBeenCalled();
  });

  it("known empty list", async () => {
    store.setUserEncryptionKeys([]);

    expect(await store.ensureEncryptionKeys()).toEqual([]);
    expect(api.getEncryptionKeys).not.toHaveBeenCalled();
  });

  it("unknown list read once for concurrent callers", async () => {
    api.getEncryptionKeys.mockResolvedValue([KEY]);

    const [first, second] = await Promise.all([
      store.ensureEncryptionKeys(),
      store.ensureEncryptionKeys(),
    ]);

    expect(first).toEqual([KEY]);
    expect(second).toEqual([KEY]);
    expect(api.getEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(store.encryptionKeys).toEqual([KEY]);
  });

  it("read fails", async () => {
    api.getEncryptionKeys.mockRejectedValue(new Error("500"));

    expect(await store.ensureEncryptionKeys()).toBeNull();
    expect(store.encryptionKeys).toBeNull();
  });

  it("read after a failure starts a new request", async () => {
    api.getEncryptionKeys.mockRejectedValueOnce(new Error("500"));
    api.getEncryptionKeys.mockResolvedValueOnce([KEY]);

    expect(await store.ensureEncryptionKeys()).toBeNull();
    expect(await store.ensureEncryptionKeys()).toEqual([KEY]);
    expect(api.getEncryptionKeys).toHaveBeenCalledTimes(2);
  });
});
