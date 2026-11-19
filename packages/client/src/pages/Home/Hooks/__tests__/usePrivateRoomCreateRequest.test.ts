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

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { stores, location } = vi.hoisted(() => ({
  stores: {
    authStore: { isAdmin: false, isRoomAdmin: true },
    clientLoadingStore: { firstLoad: false },
    treeFoldersStore: { isRoomsFolder: true },
    contextOptionsStore: { onCreateRoom: vi.fn() },
  },
  location: { pathname: "/private/filter", search: "" },
}));

vi.mock("react-router", () => ({ useLocation: () => location }));
vi.mock("SRC_DIR/store/useStore", () => ({ useStores: () => stores }));

import {
  requestPrivateRoomCreate,
  takePrivateRoomCreateRequest,
} from "SRC_DIR/helpers/privateRoomCreateRequest";

import { usePrivateRoomCreateRequest } from "../usePrivateRoomCreateRequest";

describe("usePrivateRoomCreateRequest", () => {
  beforeEach(() => {
    takePrivateRoomCreateRequest();
    stores.authStore.isRoomAdmin = true;
    stores.clientLoadingStore.firstLoad = false;
    stores.treeFoldersStore.isRoomsFolder = true;
    location.pathname = "/private/filter";
  });

  it("Room admin: the creation starts once the Private list is shown", () => {
    requestPrivateRoomCreate();
    const { rerender } = renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).toHaveBeenCalledTimes(1);
    expect(stores.contextOptionsStore.onCreateRoom).toHaveBeenCalledWith(
      null,
      false,
      "home",
    );

    rerender();
    expect(stores.contextOptionsStore.onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it("Room admin without a key: the list uses its own create entry point", () => {
    // Key setup is raised by that entry point, so the hook hands over to it
    // whether the user holds a key or not.
    requestPrivateRoomCreate();
    renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it("waits until the list is shown", () => {
    stores.clientLoadingStore.firstLoad = true;
    requestPrivateRoomCreate();
    const { rerender } = renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).not.toHaveBeenCalled();

    stores.clientLoadingStore.firstLoad = false;
    rerender();
    expect(stores.contextOptionsStore.onCreateRoom).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a request", () => {
    renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).not.toHaveBeenCalled();
  });

  it("User who cannot create rooms: the request is dropped", () => {
    stores.authStore.isRoomAdmin = false;
    requestPrivateRoomCreate();
    renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).not.toHaveBeenCalled();
    expect(takePrivateRoomCreateRequest()).toBe(false);
  });

  it("does not start outside the Private list", () => {
    location.pathname = "/rooms/shared/filter";
    requestPrivateRoomCreate();
    renderHook(() => usePrivateRoomCreateRequest());

    expect(stores.contextOptionsStore.onCreateRoom).not.toHaveBeenCalled();
  });
});
