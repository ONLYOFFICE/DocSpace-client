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

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));

vi.mock("../utils/oauthToken", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  isOAuthFrame: vi.fn(() => false),
}));

vi.mock("../api", async (io) => {
  const actual = (await io()) as { default: Record<string, unknown> };
  return {
    default: {
      ...actual.default,
      user: { logout: vi.fn(async () => undefined) },
    },
  };
});

vi.mock("../services/encryption/lock-broadcast", () => ({
  broadcastLock: vi.fn(),
}));

vi.mock("../services/encryption/device-unlock-store", () => ({
  forgetDeviceUnlock: vi.fn(async () => undefined),
}));

import { SecretStorage } from "../services/encryption/secret-storage";
import { broadcastLock } from "../services/encryption/lock-broadcast";

import { AuthStore } from "./AuthStore";
import type { CurrentQuotasStore } from "./CurrentQuotaStore";
import type { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";
import type { SettingsStore } from "./SettingsStore";
import type { UserStore } from "./UserStore";

const createStore = (user?: { id: string }) =>
  new AuthStore(
    {
      user,
      clearEncryptionKeys: vi.fn(),
    } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
    {} as unknown as CurrentQuotasStore,
    { isFrame: false, isDesktopClient: false } as unknown as SettingsStore,
  );

describe("A lock reaches every tab of the user", () => {
  beforeEach(() => {
    vi.mocked(broadcastLock).mockClear();
  });

  it("Logout in another tab", async () => {
    SecretStorage.cacheUnlocked("user-1", {
      publicKey: new Uint8Array(32).fill(1),
      privateKey: new Uint8Array(32).fill(2),
    });

    await createStore({ id: "user-1" }).logout(false);

    expect(SecretStorage.hasUnlocked("user-1")).toBe(false);
    expect(broadcastLock).toHaveBeenCalledTimes(1);
    expect(broadcastLock).toHaveBeenCalledWith("user-1");
  });

  it("Logout in another tab: nothing is sent without a signed-in user", async () => {
    await createStore().logout(false);

    expect(broadcastLock).not.toHaveBeenCalled();
  });
});
