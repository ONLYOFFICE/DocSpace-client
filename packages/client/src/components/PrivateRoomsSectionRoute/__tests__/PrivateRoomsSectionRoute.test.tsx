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
import { describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

const location = vi.hoisted(() => ({
  pathname: "/private/12/filter",
  search: "?folder=12",
  state: { highlight: 7 },
}));

vi.mock("react-router", () => ({
  Navigate: ({ to, state }: { to: string; state?: unknown }) => (
    <div
      data-testid="redirect"
      data-to={to}
      data-state={JSON.stringify(state)}
    />
  ),
  useLocation: () => location,
}));

const { default: PrivateRoomsSectionRoute } = await import("../index");

type Props = React.ComponentProps<typeof PrivateRoomsSectionRoute>;

const renderRoute = (props: Partial<Props> = {}) =>
  render(
    <PrivateRoomsSectionRoute
      isSectionAvailable
      isAppsLoaded
      isAppsLoadFailed={false}
      ensureAppsLoaded={vi.fn()}
      canManageApps
      {...(props as object)}
    >
      <div data-testid="section" />
    </PrivateRoomsSectionRoute>,
  );

describe("PrivateRoomsSectionRoute", () => {
  it("opens the section while it is available", () => {
    renderRoute();

    expect(screen.getByTestId("section")).toBeInTheDocument();
  });

  it("opens the Rooms counterpart, query and state kept, while it is not available", () => {
    renderRoute({ isSectionAvailable: false });

    const redirect = screen.getByTestId("redirect");
    expect(redirect).toHaveAttribute(
      "data-to",
      "/rooms/shared/12/filter?folder=12",
    );
    expect(redirect).toHaveAttribute(
      "data-state",
      JSON.stringify(location.state),
    );
  });

  it("waits for the apps list on standalone", () => {
    renderRoute({ isAppsLoaded: false });

    expect(screen.queryByTestId("section")).toBeNull();
    expect(screen.queryByTestId("redirect")).toBeNull();
  });

  it("does not wait for the apps list without the opt-in", () => {
    renderRoute({ isAppsLoaded: false, isSectionAvailable: false });

    expect(screen.getByTestId("redirect")).toBeInTheDocument();
  });

  it("asks for the apps list on mount", () => {
    const ensureAppsLoaded = vi.fn();

    renderRoute({ ensureAppsLoaded });

    expect(ensureAppsLoaded).toHaveBeenCalledTimes(1);
  });
});
