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


import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/oauthToken", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  isOAuthFrame: vi.fn(() => true),
}));

import { isOAuthFrame } from "../utils/oauthToken";
import { resetPortalNotFoundRedirect } from "../utils/portalNotFound";
import { PrivateRoute } from "./Route.private";
import type { PrivateRouteProps } from "./Routers.types";

const originalLocation = window.location;

const stubReplace = () => {
  const replace = vi.fn();

  Object.defineProperty(window, "location", {
    value: { href: "http://localhost/rooms/shared", pathname: "/rooms/shared", replace },
    writable: true,
    configurable: true,
  });

  return replace;
};

const LocationProbe = () => {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
};

const renderAt = (pathname: string, props: Record<string, unknown>) => {
  const allProps = {
    isLoaded: true,
    isAuthenticated: false,
    wizardCompleted: true,
    ...props,
  } as unknown as PrivateRouteProps;

  render(
    <MemoryRouter initialEntries={[pathname]}>
      <LocationProbe />
      <PrivateRoute {...allProps}>content</PrivateRoute>
    </MemoryRouter>,
  );

  return {
    pathname: () => screen.getByTestId("pathname").textContent,
    rendered: () => screen.queryByText("content") !== null,
    loading: () => screen.queryByTestId("app-loader") !== null,
  };
};

describe("PrivateRoute in an OAuth frame", () => {
  let replace: ReturnType<typeof stubReplace>;

  beforeEach(() => {
    resetPortalNotFoundRedirect();
    vi.mocked(isOAuthFrame).mockReturnValue(true);
    replace = stubReplace();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("keeps an unauthenticated frame on the loader instead of the sign-in page", () => {
    const view = renderAt("/rooms/shared", {});

    expect(view.loading()).toBe(true);
    expect(view.rendered()).toBe(false);
    expect(view.pathname()).toBe("/rooms/shared");
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not fall back to the sign-in page after a wait", () => {
    vi.useFakeTimers();
    const view = renderAt("/rooms/shared", {});

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(view.loading()).toBe(true);
    expect(view.pathname()).toBe("/rooms/shared");
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders the page once the frame is authenticated", () => {
    const view = renderAt("/rooms/shared", {
      isAuthenticated: true,
      user: { id: "user-id", isAdmin: false, isOwner: false },
    });

    expect(view.rendered()).toBe(true);
    expect(view.loading()).toBe(false);
  });

  it("still sends an unauthenticated visitor outside a frame to the sign-in page", () => {
    vi.mocked(isOAuthFrame).mockReturnValue(false);

    const view = renderAt("/rooms/shared", {});

    expect(view.loading()).toBe(false);
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("/login"));
  });
});
