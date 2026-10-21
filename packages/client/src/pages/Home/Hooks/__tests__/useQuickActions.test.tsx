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
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@onlyoffice/apps-ui-kit/ai-agent/ai-chat-panel/hooks/useOpenAiChat",
  () => ({ useOpenAiChat: () => vi.fn() }),
);
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/availability", () => ({
  useIsAiChatAvailable: () => true,
}));

import { useQuickActions } from "../useQuickActions";

describe("useQuickActions — Private section", () => {
  const privateList = { currentFolderId: 2002, isRoomsFolder: true };

  it("Banner on a non-empty Private list: only the Private room tile", () => {
    const onCreatePrivateRoom = vi.fn();
    const { result } = renderHook(() =>
      useQuickActions({
        ...privateList,
        isPrivateRoomsSection: true,
        canCreateRooms: true,
        onCreatePrivateRoom,
      }),
    );

    expect(result.current.show).toBe(true);
    expect(result.current.items.map((item) => item.id)).toEqual([
      "quick-private-room",
    ]);

    result.current.items[0].onClick?.({} as never);
    expect(onCreatePrivateRoom).toHaveBeenCalledTimes(1);
  });

  it("shows no banner to users who may not create rooms", () => {
    const { result } = renderHook(() =>
      useQuickActions({
        ...privateList,
        isPrivateRoomsSection: true,
        canCreateRooms: false,
      }),
    );

    expect(result.current.show).toBe(false);
  });

  it("keeps the room tiles and the AI tile of the Rooms list", () => {
    const { result } = renderHook(() =>
      useQuickActions({ ...privateList, canCreateRooms: true }),
    );

    const ids = result.current.items.map((item) => item.id);
    expect(ids).toContain("quick-custom-room");
    expect(ids).toContain("quick-ai-chat");
    expect(ids).not.toContain("quick-private-room");
  });
});
