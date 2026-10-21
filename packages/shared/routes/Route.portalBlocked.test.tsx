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

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TenantStatus } from "../enums";
import { resetPortalNotFoundRedirect } from "../utils/portalNotFound";
import { PrivateRoute } from "./Route.private";
import { PublicRoute } from "./Route.public";
import type { PrivateRouteProps, PublicRouteProps } from "./Routers.types";

// A blocked portal refuses every request but the settings, so nobody can sign
// in and every address must end on the unavailable page - never on the login
// form, which a 401 from the other requests would otherwise suggest.
const privateProps = {
  isLoaded: true,
  isAuthenticated: false,
  wizardCompleted: true,
  standalone: false,
  tenantStatus: TenantStatus.PortalBlocked,
  isPortalDeactivate: false,
  isPortalBlocked: true,
} as unknown as PrivateRouteProps;

const publicProps = {
  isFirstLoaded: true,
  isAuthenticated: false,
  wizardCompleted: true,
  tenantStatus: TenantStatus.PortalBlocked,
  isPortalDeactivate: false,
  isPortalBlocked: true,
} as unknown as PublicRouteProps;

const stubReplace = () => {
  const replace = vi.fn();

  Object.defineProperty(window, "location", {
    value: { href: "http://localhost/", pathname: "/", replace },
    writable: true,
    configurable: true,
  });

  return replace;
};

// The guarded element sits at `pathname`; the unavailable page and the portal
// root are markers, so a redirect shows up as the marker it lands on.
const renderAt = (element: React.ReactElement, pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/unavailable" element={<div>unavailable page</div>} />
        <Route path="/" element={<div>root page</div>} />
        <Route path={pathname} element={element} />
      </Routes>
    </MemoryRouter>,
  );

// The unavailable page itself, guarded the way the client route guards it.
const renderUnavailable = (element: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={["/unavailable"]}>
      <Routes>
        <Route path="/unavailable" element={element} />
        <Route path="/" element={<div>root page</div>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("routes on a blocked portal", () => {
  let replace: ReturnType<typeof stubReplace>;

  beforeEach(() => {
    resetPortalNotFoundRedirect();
    replace = stubReplace();
  });

  it("sends a guest of a private page to the unavailable page, not to login", () => {
    renderAt(
      <PrivateRoute {...privateProps}>content</PrivateRoute>,
      "/rooms/shared",
    );

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining("/unavailable"),
    );
  });

  it("sends a signed-in user of a private page to the unavailable page", () => {
    renderAt(
      <PrivateRoute
        {...privateProps}
        isAuthenticated
        user={{ id: "user" } as PrivateRouteProps["user"]}
      >
        content
      </PrivateRoute>,
      "/rooms/shared",
    );

    expect(screen.getByText("unavailable page")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it.each([
    { name: "a guest", isAuthenticated: false },
    { name: "a signed-in user", isAuthenticated: true },
  ])("sends $name of a public page to the unavailable page", ({
    isAuthenticated,
  }) => {
    renderAt(
      <PublicRoute {...publicProps} isAuthenticated={isAuthenticated}>
        content
      </PublicRoute>,
      "/access-denied",
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText("unavailable page")).toBeInTheDocument();
  });

  it.each([
    { name: "a guest", isAuthenticated: false },
    { name: "a signed-in user", isAuthenticated: true },
  ])("shows the unavailable page to $name", ({ isAuthenticated }) => {
    renderUnavailable(
      <PublicRoute {...publicProps} isAuthenticated={isAuthenticated}>
        blocked text
      </PublicRoute>,
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText("blocked text")).toBeInTheDocument();
  });
});
