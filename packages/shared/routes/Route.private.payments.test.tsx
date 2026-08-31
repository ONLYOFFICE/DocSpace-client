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
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { resetPortalNotFoundRedirect } from "../utils/portalNotFound";
import { PrivateRoute } from "./Route.private";
import type { PrivateRouteProps } from "./Routers.types";

const STANDALONE_LICENSE_URL = "/portal-settings/payments/portal-payments";

const admin = { isAdmin: true, isOwner: false };
const owner = { isAdmin: false, isOwner: true };
const member = { isAdmin: false, isOwner: false };

// The guard settles the location, so the probe reports where the visitor ended
// up rather than which branch fired - a redirect chain that never converges
// fails here instead of shipping.
const LocationProbe = () => {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
};

const renderAt = (pathname: string, props: Record<string, unknown>) => {
  const allProps = {
    isLoaded: true,
    isAuthenticated: true,
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
  };
};

describe("PrivateRoute on the payments section", () => {
  beforeEach(() => {
    resetPortalNotFoundRedirect();
  });

  it("sends a standalone admin from SaaS billing to the license page", () => {
    const view = renderAt("/billing/wallet", { standalone: true, user: admin });

    expect(view.pathname()).toBe(STANDALONE_LICENSE_URL);
  });

  it("sends a standalone owner from the Stripe callback to the license page", () => {
    const view = renderAt("/billing/payment-complete", {
      standalone: true,
      user: owner,
    });

    expect(view.pathname()).toBe(STANDALONE_LICENSE_URL);
  });

  it("closes the wallet under portal settings for standalone too", () => {
    const view = renderAt("/portal-settings/payments/wallet", {
      standalone: true,
      user: admin,
    });

    expect(view.pathname()).toBe(STANDALONE_LICENSE_URL);
  });

  it("sends a standalone member home instead of to the license page", () => {
    const view = renderAt("/billing/wallet", { standalone: true, user: member });

    expect(view.pathname()).toBe("/");
  });

  it("renders the license page itself, so the redirect does not loop", () => {
    const view = renderAt(STANDALONE_LICENSE_URL, {
      standalone: true,
      user: admin,
    });

    expect(view.pathname()).toBe(STANDALONE_LICENSE_URL);
    expect(view.rendered()).toBe(true);
  });

  it("closes the whole section on Community, license page included", () => {
    const view = renderAt(STANDALONE_LICENSE_URL, {
      standalone: true,
      isCommunity: true,
      user: owner,
    });

    expect(view.pathname()).toBe("/");
  });

  it("leaves SaaS billing alone", () => {
    const view = renderAt("/billing/addons", {
      standalone: false,
      user: admin,
    });

    expect(view.pathname()).toBe("/billing/addons");
    expect(view.rendered()).toBe(true);
  });

  it("keeps restricted SaaS billing open for an admin", () => {
    const view = renderAt("/billing/addons", {
      standalone: false,
      restricted: true,
      isAdmin: true,
      user: admin,
    });

    expect(view.pathname()).toBe("/billing/addons");
    expect(view.rendered()).toBe(true);
  });

  it("bounces a member off restricted SaaS billing to 401", () => {
    const view = renderAt("/billing/wallet", {
      standalone: false,
      restricted: true,
      isAdmin: false,
      user: member,
    });

    expect(view.pathname()).toBe("/error/401");
    expect(view.rendered()).toBe(false);
  });
});
