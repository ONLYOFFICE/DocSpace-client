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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmployeeStatus, MembersSubjectType } from "@docspace/shared/enums";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  getRoomMembers: vi.fn(),
  listedIds: [] as string[],
  emptyShown: false,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { rooms: { getRoomMembers: mocks.getRoomMembers } },
}));

vi.mock("@docspace/shared/services/private-room/room-member-flows", () => ({
  loadPendingAccess: vi.fn(async () => undefined),
}));

vi.mock("./PrivateMemberUser", () => ({
  default: ({ userId }: { userId: string }) => {
    mocks.listedIds.push(userId);
    return null;
  },
}));

vi.mock(
  "@/app/(docspace)/_components/info-panel/views/Members/sub-components/EmptyContainer",
  () => ({
    default: () => {
      mocks.emptyShown = true;
      return null;
    },
  }),
);

import PrivateMembersView from "./PrivateMembersView";

const member = (id: string, sharedTo: Record<string, unknown> = {}) => ({
  access: 2,
  canEditAccess: true,
  isOwner: false,
  subjectType: MembersSubjectType.User,
  sharedTo: { id, displayName: id, ...sharedTo },
});

describe("PrivateMembersView: search", () => {
  let root: Root | null = null;

  const search = async (items: unknown[], total = items.length) => {
    mocks.listedIds = [];
    mocks.emptyShown = false;
    mocks.getRoomMembers.mockResolvedValue({ items, total });
    root = createRoot(document.createElement("div"));
    await act(async () => {
      root?.render(
        <PrivateMembersView roomId={9100} currentUserId="u-me" filterValue="a" />,
      );
    });
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Members searched", async () => {
    await search([
      member("ann"),
      member("guest", { isVisitor: true }),
      member("gone", { status: EmployeeStatus.Disabled }),
    ]);

    expect(mocks.listedIds).toEqual(["ann"]);
    expect(mocks.emptyShown).toBe(false);
  });

  it("A page of only excluded members shows the empty state", async () => {
    await search([member("guest", { isVisitor: true })], 30);

    expect(mocks.listedIds).toEqual([]);
    expect(mocks.emptyShown).toBe(true);
  });
});
