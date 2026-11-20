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

const navigate = vi.fn();

vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("SRC_DIR/components/BetaBadgeWrapper", () => ({
  default: () => null,
}));

import { takePrivateRoomCreateRequest } from "SRC_DIR/helpers/privateRoomCreateRequest";

import { useModuleItems, type UseModuleItemsProps } from "../useModuleItems";

const baseProps: UseModuleItemsProps = {
  isGuest: false,
  canCreateRooms: true,
  isWarningRoomsDialog: false,
  setQuotaWarningDialogVisible: vi.fn(),
  isAppInstalled: () => true,
  canEnableApps: false,
  isAiHubAvailable: true,
  privateRooms: "on",
};

const render = (props: Partial<UseModuleItemsProps> = {}) =>
  renderHook(() => useModuleItems({ ...baseProps, ...props })).result.current;

const privateCard = (props: Partial<UseModuleItemsProps> = {}) =>
  render(props).find((item) => item.id === "e2e-rooms");

describe("useModuleItems: the card of private rooms", () => {
  beforeEach(() => {
    navigate.mockReset();
    takePrivateRoomCreateRequest();
  });

  it("Room admin: the button opens the Private list and leaves the request to create", () => {
    const card = privateCard({ canCreateRooms: true });

    expect(card?.buttonLabel).toBe("Common:CreatePrivateRoom");

    card?.onAction();
    expect(navigate).toHaveBeenCalledWith("/private/filter");
    expect(takePrivateRoomCreateRequest()).toBe(true);
  });

  it("User who cannot create rooms: the button reads Open and leaves no request", () => {
    const card = privateCard({ canCreateRooms: false });

    expect(card?.buttonLabel).toBe("Common:Open");

    card?.onAction();
    expect(navigate).toHaveBeenCalledWith("/private/filter");
    expect(takePrivateRoomCreateRequest()).toBe(false);
  });

  it("Section available: the card follows Forms and precedes AI Workspace", () => {
    const items = render();

    expect(items.map((item) => item.id)).toEqual([
      "ai-files",
      "ai-rooms",
      "ai-forms",
      "e2e-rooms",
      "ai-hub",
    ]);

    const card = items[3];
    expect(card.title).toBe("Common:Private");
    expect(card.description).toBe("Common:DashboardE2eRoomsDescription");
    expect(card.installed).toBe(true);
    expect(card.noTour).toBe(true);
  });

  it("Card with the badge: only the card of private rooms carries one", () => {
    const items = render();

    expect(items.filter((item) => item.badge).map((item) => item.id)).toEqual([
      "e2e-rooms",
    ]);
  });

  it("Section not available: no card", () => {
    expect(privateCard({ privateRooms: "none" })).toBeUndefined();
  });

  it("App switched off on a standalone portal: a disabled card for whoever may switch apps on", () => {
    const card = privateCard({ privateRooms: "off", canEnableApps: true });

    expect(card?.installed).toBe(false);
    expect(card?.buttonLabel).toBe("Common:GoToSettings");

    card?.onAction();
    expect(navigate).toHaveBeenCalledWith("/portal-settings/apps");
  });

  it("App switched off on a standalone portal: no card for a user who cannot switch apps on", () => {
    expect(
      privateCard({ privateRooms: "off", canEnableApps: false }),
    ).toBeUndefined();
  });
});
