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

import { ShareAccessRights } from "@docspace/shared/enums";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  getRoomMembers: vi.fn(),
  rows: new Map<string, { canChangeRole: boolean }>(),
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
  default: (props: { userId: string; canChangeRole: boolean }) => {
    mocks.rows.set(props.userId, { canChangeRole: props.canChangeRole });
    return null;
  },
}));

vi.mock(
  "@/app/(docspace)/_components/info-panel/views/Members/sub-components/EmptyContainer",
  () => ({ default: () => null }),
);

import PrivateMembersView from "./PrivateMembersView";

const member = (
  id: string,
  { canEditAccess = true, isOwner = false } = {},
) => ({
  access: isOwner ? ShareAccessRights.FullAccess : ShareAccessRights.Editing,
  canEditAccess,
  isOwner,
  sharedTo: { id, displayName: id, email: `${id}@example.com` },
});

describe("SDK role control of private-room members", () => {
  let root: Root | null = null;

  const show = async (canEditMembers: boolean) => {
    mocks.rows.clear();
    mocks.getRoomMembers.mockResolvedValue({
      items: [
        member("owner", { isOwner: true }),
        member("me"),
        member("editable"),
        member("locked", { canEditAccess: false }),
      ],
      total: 4,
    });
    root = createRoot(document.createElement("div"));
    await act(async () => {
      root?.render(
        <PrivateMembersView
          roomId={9100}
          currentUserId="me"
          canEditMembers={canEditMembers}
        />,
      );
    });
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const offered = () =>
    Object.fromEntries(
      Array.from(mocks.rows, ([id, row]) => [id, row.canChangeRole]),
    );

  it("offers the role control only to an editable member who is neither the owner nor oneself", async () => {
    await show(true);

    expect(offered()).toEqual({
      owner: false,
      me: false,
      editable: true,
      locked: false,
    });
  });

  it("offers it to nobody without the room edit right", async () => {
    await show(false);

    expect(offered()).toEqual({
      owner: false,
      me: false,
      editable: false,
      locked: false,
    });
  });
});
