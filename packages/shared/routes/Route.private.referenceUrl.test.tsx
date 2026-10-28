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
  let current = href;
  const location = {
    origin: url.origin,
    pathname: url.pathname,
    assigned,
    get href() {
      return current;
    },
    set href(value: string) {
      assigned.push(value);
      current = value;
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

  it("follows the address only once", () => {
    sessionStorage.setItem("referenceUrl", ROOM);
    sessionStorage.setItem("loggedOutUserId", self.id);

    renderAtRoot();

    expect(sessionStorage.getItem("referenceUrl")).toBeNull();
    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });
});
