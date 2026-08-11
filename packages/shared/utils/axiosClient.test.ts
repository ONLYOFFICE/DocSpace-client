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

import AxiosClient from "./axiosClient";
import {
  claimPortalNotFoundRedirect,
  resetPortalNotFoundRedirect,
} from "./portalNotFound";

type TRedirectFlags = {
  __redirectToLogin?: boolean;
};

const flags = () => window as unknown as TRedirectFlags;

const HOME = "http://localhost/";

// jsdom neither navigates nor records an href assignment, so the one thing
// these tests need to observe has to be stubbed.
const stubLocation = () => {
  const location = { href: HOME, origin: "http://localhost", pathname: "/" };

  Object.defineProperty(window, "location", {
    value: location,
    writable: true,
    configurable: true,
  });

  return location;
};

// The logout request the 401 branch fires before navigating resolves on its
// own microtask chain.
const flushPending = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * A client whose every request fails the way a deleted portal fails them, so
 * the error handling is the only thing under test.
 */
const createFailingClient = (status: number) => {
  const client = new AxiosClient();

  client.client!.defaults.adapter = () =>
    Promise.reject({ response: { status } });

  return client;
};

describe("AxiosClient error redirects", () => {
  let location: ReturnType<typeof stubLocation>;

  beforeEach(() => {
    flags().__redirectToLogin = undefined;
    resetPortalNotFoundRedirect();
    location = stubLocation();
  });

  it("sends an unauthorized visitor to the login page", async () => {
    const client = createFailingClient(401);

    await client.request({ method: "get", url: "/settings" });
    await flushPending();

    expect(flags().__redirectToLogin).toBe(true);
    expect(location.href).toContain("/login?authError=true");
  });

  it("keeps a redirect claimed while the logout roundtrip was in flight", async () => {
    const client = createFailingClient(401);

    // The 401 branch checks the claim on entry, fires the logout request and
    // navigates in its .then. Answering that logout locally lets the claim
    // land exactly in between - the moment a /settings 404 would land.
    const restore = client.interceptRoute({
      match: (config) => config.url === "/authentication/logout",
      fulfill: () => {
        claimPortalNotFoundRedirect();
        return {};
      },
    });

    await client.request({ method: "get", url: "/settings" });
    await flushPending();
    restore();

    expect(location.href).toBe(HOME);
  });

  it("keeps the wrong portal name redirect once the portal is known to be gone", async () => {
    // SettingsStore claims this the moment /settings answers 404, before it
    // starts navigating. A 401 arriving afterwards used to replace the
    // half-started navigation with a trip to the login page, which a deleted
    // portal answers by sending the visitor back here.
    claimPortalNotFoundRedirect();

    const client = createFailingClient(401);

    await client.request({ method: "get", url: "/settings" });
    await flushPending();

    expect(flags().__redirectToLogin).toBeUndefined();
    expect(location.href).toBe(HOME);
  });
});
