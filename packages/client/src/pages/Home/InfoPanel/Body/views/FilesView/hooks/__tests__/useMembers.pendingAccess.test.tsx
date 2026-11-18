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
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TRoom } from "@docspace/shared/api/rooms/types";

import type { UseMembersProps } from "../../../Members/Members.types";

const mocks = vi.hoisted(() => ({
  loadPendingAccess: vi.fn(async () => undefined),
  getRoomMembers: vi.fn(async () => ({ items: [], total: 0 })),
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { rooms: { getRoomMembers: mocks.getRoomMembers } },
}));

vi.mock(
  "@docspace/shared/services/private-room/room-member-flows",
  () => ({ loadPendingAccess: mocks.loadPendingAccess }),
);

import { useMembers } from "../useMembers";

const roomWith = (overrides: Partial<TRoom>) =>
  ({
    id: 9100,
    roomType: 5,
    isTemplate: false,
    private: true,
    security: { EditAccess: true },
    ...overrides,
  }) as unknown as TRoom;

const load = async (room: TRoom) => {
  const { result } = renderHook(() =>
    useMembers({
      room,
      setExternalLinks: vi.fn(),
      scrollToTop: vi.fn(),
      isMembersPanelUpdating: false,
      setIsMembersPanelUpdating: vi.fn(),
    } as unknown as UseMembersProps),
  );
  await act(async () => {
    await result.current.fetchMembers();
  });
};

describe("useMembers: pending access", () => {
  beforeEach(() => {
    mocks.loadPendingAccess.mockClear();
  });

  it("Marker after a reload: the list of a private room reads the missing keys", async () => {
    await load(roomWith({}));

    expect(mocks.loadPendingAccess).toHaveBeenCalledWith(9100);
  });

  it("reads nothing for a room that is not private", async () => {
    await load(roomWith({ private: false }));

    expect(mocks.loadPendingAccess).not.toHaveBeenCalled();
  });

  it("reads nothing for a member who may not change the access", async () => {
    await load(
      roomWith({ security: { EditAccess: false } as TRoom["security"] }),
    );

    expect(mocks.loadPendingAccess).not.toHaveBeenCalled();
  });
});
