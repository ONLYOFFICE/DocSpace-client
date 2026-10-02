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
  isOAuthFrame: vi.fn(() => true),
}));

vi.mock("../api/client", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getAuthToken: vi.fn(() => "bearer-token"),
  signOutOAuth: vi.fn(),
  setWithCredentialsStatus: vi.fn(),
}));

vi.mock("../utils/common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  frameCallEvent: vi.fn(),
}));

vi.mock("../api", async (io) => {
  const actual = (await io()) as { default: Record<string, unknown> };
  return {
    default: {
      ...actual.default,
      settings: { getCapabilities: vi.fn(async () => null) },
      user: { logout: vi.fn(async () => undefined) },
    },
  };
});

import api from "../api";
import { getAuthToken, setWithCredentialsStatus, signOutOAuth } from "../api/client";
import { frameCallEvent } from "../utils/common";
import { isOAuthFrame } from "../utils/oauthToken";

import { AuthStore } from "./AuthStore";
import type { CurrentQuotasStore } from "./CurrentQuotaStore";
import type { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";
import type { SettingsStore } from "./SettingsStore";
import type { UserStore } from "./UserStore";

const createStore = (settings: Record<string, unknown> = {}) => {
  const settingsStore = {
    init: vi.fn(async () => undefined),
    isLoaded: true,
    socketUrl: "",
    isPortalDeactivate: false,
    passwordSettings: {},
    culture: "en",
    isFrame: true,
    isDesktopClient: false,
    ...settings,
  };
  const userStore = {
    user: undefined,
    init: vi.fn(async () => undefined),
    setIsLoaded: vi.fn(),
    clearEncryptionKeys: vi.fn(),
  };

  return new AuthStore(
    userStore as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
    {} as unknown as CurrentQuotasStore,
    settingsStore as unknown as SettingsStore,
  );
};

const authErrorCalls = () =>
  vi
    .mocked(frameCallEvent)
    .mock.calls.filter(
      ([arg]) => (arg as { event?: string }).event === "onAuthError",
    );

describe("AuthStore in an OAuth frame", () => {
  beforeEach(() => {
    vi.mocked(isOAuthFrame).mockReturnValue(true);
    vi.mocked(getAuthToken).mockReturnValue("bearer-token");
  });

  describe("init", () => {
    it("reports UNAUTHORIZED when the portal answers a bearer token anonymously", async () => {
      await createStore().init();

      expect(authErrorCalls()).toEqual([
        [
          {
            event: "onAuthError",
            data: { code: "UNAUTHORIZED", message: "unauthorized" },
          },
        ],
      ]);
    });

    it("stays silent when no token was sent yet", async () => {
      vi.mocked(getAuthToken).mockReturnValue(null);

      await createStore().init();

      expect(authErrorCalls()).toEqual([]);
    });

    it("stays silent when the token signed the user in", async () => {
      await createStore({ socketUrl: "/socket.io" }).init();

      expect(authErrorCalls()).toEqual([]);
    });

    it("stays silent on a deactivated portal", async () => {
      await createStore({ isPortalDeactivate: true }).init();

      expect(authErrorCalls()).toEqual([]);
    });

    it("stays silent outside an OAuth frame", async () => {
      vi.mocked(isOAuthFrame).mockReturnValue(false);

      await createStore().init();

      expect(authErrorCalls()).toEqual([]);
    });
  });

  describe("logout", () => {
    it("signs the frame out without the cookie logout", async () => {
      await createStore().logout();

      expect(api.user.logout).not.toHaveBeenCalled();
      expect(signOutOAuth).toHaveBeenCalledTimes(1);
      expect(setWithCredentialsStatus).not.toHaveBeenCalled();
      expect(frameCallEvent).toHaveBeenCalledWith({ event: "onSignOut" });
    });

    it("keeps the cookie logout outside an OAuth frame", async () => {
      vi.mocked(isOAuthFrame).mockReturnValue(false);

      await createStore().logout(false);

      expect(api.user.logout).toHaveBeenCalledTimes(1);
      expect(signOutOAuth).not.toHaveBeenCalled();
    });
  });
});
