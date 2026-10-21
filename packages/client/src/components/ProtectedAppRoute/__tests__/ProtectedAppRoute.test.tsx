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
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

const router = vi.hoisted(() => ({
  search: "",
  params: {} as { room?: string },
}));

vi.mock("react-router", () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="redirect" data-to={to} />
  ),
  useLocation: () => ({ pathname: "/rooms/shared/filter", search: router.search }),
  useParams: () => router.params,
}));

const { default: ProtectedAppRoute } = await import("../index");

type Props = React.ComponentProps<typeof ProtectedAppRoute>;

const renderRoute = (props: Partial<Props> = {}) =>
  render(
    <ProtectedAppRoute
      appId="ai-rooms"
      isInstalled={() => true}
      isAppsLoaded
      isAppsLoadFailed={false}
      ensureAppsLoaded={vi.fn()}
      canManageApps
      isGuest={false}
      isPrivateRoomsSectionAvailable={false}
      {...(props as object)}
    >
      <div data-testid="section" />
    </ProtectedAppRoute>,
  );

describe("ProtectedAppRoute", () => {
  beforeEach(() => {
    router.search = "";
    router.params = {};
  });

  it("renders nothing on standalone while the apps list is loading", () => {
    renderRoute({ isAppsLoaded: false });

    expect(screen.queryByTestId("section")).toBeNull();
    expect(screen.queryByTestId("redirect")).toBeNull();
  });

  it("lets the section through when the apps list failed to load", () => {
    renderRoute({ isAppsLoaded: false, isAppsLoadFailed: true });

    expect(screen.getByTestId("section")).toBeInTheDocument();
  });

  it("does not wait for the list in SaaS", () => {
    renderRoute({ isAppsLoaded: false, canManageApps: false });

    expect(screen.getByTestId("section")).toBeInTheDocument();
  });

  it("redirects to the dashboard when the app is switched off", () => {
    renderRoute({ isInstalled: () => false });

    expect(screen.getByTestId("redirect")).toHaveAttribute(
      "data-to",
      "/dashboard",
    );
  });

  it("lets a shared route through while either of its apps is on", () => {
    renderRoute({
      appId: ["ai-rooms", "ai-forms"],
      isInstalled: (id: string) => id === "ai-forms",
    });

    expect(screen.getByTestId("section")).toBeInTheDocument();
  });

  it("asks for the apps list on mount", () => {
    const ensureAppsLoaded = vi.fn();

    renderRoute({ ensureAppsLoaded });

    expect(ensureAppsLoaded).toHaveBeenCalledTimes(1);
  });

  it("keeps a guest out of a guest-restricted app", () => {
    renderRoute({ appId: "ai-files", isGuest: true });

    expect(screen.getByTestId("redirect")).toBeInTheDocument();
  });

  describe("a Rooms room address while the Rooms app is off", () => {
    const roomsOff = {
      admitPrivateRooms: true,
      isInstalled: () => false,
    } as Partial<Props>;

    it("admits a room address while the Private section is available", () => {
      router.params = { room: "12" };

      renderRoute({ ...roomsOff, isPrivateRoomsSectionAvailable: true });

      expect(screen.getByTestId("section")).toBeInTheDocument();
    });

    it("admits a folder address while the Private section is available", () => {
      router.search = "?folder=12";

      renderRoute({ ...roomsOff, isPrivateRoomsSectionAvailable: true });

      expect(screen.getByTestId("section")).toBeInTheDocument();
    });

    it("keeps the list out", () => {
      renderRoute({ ...roomsOff, isPrivateRoomsSectionAvailable: true });

      expect(screen.getByTestId("redirect")).toBeInTheDocument();
    });

    it("keeps a room address out without the Private section", () => {
      router.params = { room: "12" };

      renderRoute({ ...roomsOff, isPrivateRoomsSectionAvailable: false });

      expect(screen.getByTestId("redirect")).toBeInTheDocument();
    });

    it("keeps a room address out of a route that does not admit private rooms", () => {
      router.params = { room: "12" };

      renderRoute({
        ...roomsOff,
        admitPrivateRooms: false,
        isPrivateRoomsSectionAvailable: true,
      });

      expect(screen.getByTestId("redirect")).toBeInTheDocument();
    });
  });
});
