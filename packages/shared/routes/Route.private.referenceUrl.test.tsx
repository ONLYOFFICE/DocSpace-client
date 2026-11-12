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

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resetPortalNotFoundRedirect } from "../utils/portalNotFound";
import { PrivateRoute } from "./Route.private";
import type { PrivateRouteProps } from "./Routers.types";

const ROOT = "http://localhost/";
const ROOM = "http://localhost/rooms/shared/12/filter?folder=12";

const self = { id: "self-id", isAdmin: false, isOwner: false };

// jsdom neither navigates nor records an href assignment, so the redirect has
// to be observed on a stub.
const stubLocation = (href: string) => {
  const url = new URL(href);
  const assigned: string[] = [];
  const replaced: string[] = [];
  let current = href;
  const location = {
    origin: url.origin,
    pathname: url.pathname,
    assigned,
    replaced,
    get href() {
      return current;
    },
    set href(value: string) {
      assigned.push(value);
      current = value;
    },
    replace(value: string) {
      replaced.push(value);
    },
  };

  Object.defineProperty(window, "location", {
    value: location,
    writable: true,
    configurable: true,
  });

  return location;
};

const realLocation = window.location;

// The tab arrives at the portal root, where the login page sends a visitor
// whose session is already alive (logged in in another tab).
const renderAtRoot = () => {
  const props = {
    isLoaded: true,
    isAuthenticated: true,
    wizardCompleted: true,
    user: self,
  } as unknown as PrivateRouteProps;

  render(
    <MemoryRouter initialEntries={["/"]}>
      <PrivateRoute {...props}>content</PrivateRoute>
    </MemoryRouter>,
  );
};

describe("PrivateRoute returning a tab to where it was before the login", () => {
  let location: ReturnType<typeof stubLocation>;

  beforeEach(() => {
    resetPortalNotFoundRedirect();
    sessionStorage.clear();
    location = stubLocation(ROOT);
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: realLocation,
      writable: true,
      configurable: true,
    });
  });

  it("opens the page the session ran out on", () => {
    sessionStorage.setItem("referenceUrl", ROOM);

    renderAtRoot();

    expect(location.href).toBe(ROOM);
  });

  it("opens the page of the same user after a logout from another session", () => {
    sessionStorage.setItem("referenceUrl", ROOM);
    sessionStorage.setItem("loggedOutUserId", self.id);

    renderAtRoot();

    expect(location.href).toBe(ROOM);
  });

  it("never opens the page another user left", () => {
    sessionStorage.setItem("referenceUrl", ROOM);
    sessionStorage.setItem("loggedOutUserId", "another-user-id");

    renderAtRoot();

    expect(location.href).toBe(ROOT);
  });

  it("does not reload a page that is already open", () => {
    location = stubLocation(ROOM);
    sessionStorage.setItem("referenceUrl", ROOM);

    renderAtRoot();

    expect(location.assigned).toEqual([]);
  });

  // The 401 handler knows no user; it names the one this tab last showed, so
  // a page left by a session that ran out is reopened only for that user.
  it("remembers which user the tab is showing", () => {
    renderAtRoot();

    expect(sessionStorage.getItem("sessionUserId")).toBe(self.id);
  });

  it("follows the address only once", () => {
    sessionStorage.setItem("referenceUrl", ROOM);
    sessionStorage.setItem("loggedOutUserId", self.id);

    renderAtRoot();

    expect(sessionStorage.getItem("referenceUrl")).toBeNull();
    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });
});

const SECURITY = "http://localhost/portal-settings/security/access-portal";

// A tab whose session cookie is gone is reloaded: the portal answers it
// anonymously, with no 401, and the route sends it to the login page itself.
const renderSignedOut = (pathname: string) => {
  const props = {
    isLoaded: true,
    isAuthenticated: false,
    wizardCompleted: true,
    user: undefined,
  } as unknown as PrivateRouteProps;

  render(
    <MemoryRouter initialEntries={[pathname]}>
      <PrivateRoute {...props}>content</PrivateRoute>
    </MemoryRouter>,
  );
};

describe("PrivateRoute sending a signed-out tab to the login page", () => {
  let location: ReturnType<typeof stubLocation>;

  beforeEach(() => {
    resetPortalNotFoundRedirect();
    sessionStorage.clear();
    location = stubLocation(SECURITY);
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: realLocation,
      writable: true,
      configurable: true,
    });
  });

  it("keeps the page for the next login", () => {
    renderSignedOut(new URL(SECURITY).pathname);

    expect(location.replaced).toEqual(["/login"]);
    expect(sessionStorage.getItem("referenceUrl")).toBe(SECURITY);
  });

  // Bug 84856: the owner's settings page was opened for the user who logged
  // in next in the tab, and answered with the access error.
  it("names the user the tab was showing, so the page is reopened only for them", () => {
    sessionStorage.setItem("sessionUserId", "owner-id");

    renderSignedOut(new URL(SECURITY).pathname);

    expect(sessionStorage.getItem("loggedOutUserId")).toBe("owner-id");
  });

  it("names no one when the tab never learned its user", () => {
    renderSignedOut(new URL(SECURITY).pathname);

    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });

  it("names no one for the portal root, which it does not keep", () => {
    location = stubLocation(ROOT);
    sessionStorage.setItem("sessionUserId", "owner-id");

    renderSignedOut("/");

    expect(sessionStorage.getItem("referenceUrl")).toBeNull();
    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });

  // The route reopens the page for the owner and for no one else.
  it("does not open the page for another user after the login", () => {
    sessionStorage.setItem("sessionUserId", "owner-id");
    renderSignedOut(new URL(SECURITY).pathname);

    location = stubLocation(ROOT);
    renderAtRoot();

    expect(location.assigned).toEqual([]);
    expect(sessionStorage.getItem("referenceUrl")).toBeNull();
  });
});
