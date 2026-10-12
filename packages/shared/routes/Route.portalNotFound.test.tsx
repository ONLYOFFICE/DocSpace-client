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
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  claimPortalNotFoundRedirect,
  resetPortalNotFoundRedirect,
} from "../utils/portalNotFound";
import { PrivateRoute } from "./Route.private";
import { PublicRoute } from "./Route.public";
import type { PrivateRouteProps, PublicRouteProps } from "./Routers.types";

// A deleted portal fails every request, so both guards see an unauthenticated
// visitor of a loaded portal — the state in which they redirect to the login
// page. That page bounces the auth cookie that outlived the portal back to the
// portal root, and the loop is closed.
const privateProps = {
  isLoaded: true,
  isAuthenticated: false,
  wizardCompleted: true,
  standalone: false,
} as unknown as PrivateRouteProps;

const publicProps = {
  isFirstLoaded: true,
  isAuthenticated: false,
  wizardCompleted: true,
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

const renderInRouter = (element: React.ReactElement, pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>{element}</MemoryRouter>,
  );

describe.each([
  {
    name: "PrivateRoute",
    pathname: "/portal-settings/delete-data/deletion",
    element: <PrivateRoute {...privateProps}>content</PrivateRoute>,
  },
  {
    name: "PublicRoute",
    pathname: "/",
    element: <PublicRoute {...publicProps}>content</PublicRoute>,
  },
])("$name on a portal that no longer exists", ({ pathname, element }) => {
  let replace: ReturnType<typeof stubReplace>;

  beforeEach(() => {
    resetPortalNotFoundRedirect();
    replace = stubReplace();
  });

  it("redirects to the login page while the portal is reachable", () => {
    renderInRouter(element, pathname);

    expect(replace).toHaveBeenCalledWith(expect.stringContaining("/login"));
  });

  it("leaves the wrong portal name redirect alone once the portal is gone", () => {
    claimPortalNotFoundRedirect();

    const { container } = renderInRouter(element, pathname);

    expect(replace).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });
});
