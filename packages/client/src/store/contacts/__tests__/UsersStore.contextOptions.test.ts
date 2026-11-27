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

import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import { EmployeeStatus, EmployeeType } from "@docspace/shared/enums";

import UsersStore from "../UsersStore";

type TStoreArgs = ConstructorParameters<typeof UsersStore>;
type TViewer = { isOwner?: boolean; isAdmin?: boolean; isRoomAdmin?: boolean };

const optionsFor = (
  viewer: TViewer,
  account: {
    isMySelf?: boolean;
    sso?: boolean;
    ldap?: boolean;
    role?: EmployeeType;
    statusType?: "active" | "pending" | "disabled";
  },
) => {
  const store = new UsersStore(
    ...([
      {},
      { user: { id: "me", ...viewer } },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ] as unknown as TStoreArgs),
  );
  const role = account.role ?? EmployeeType.User;

  return (
    store.getUserContextOptions(
      account.isMySelf ?? false,
      account.sso ?? false,
      account.ldap ?? false,
      role === EmployeeType.Guest,
      account.statusType ?? "active",
      role,
      EmployeeStatus.Active,
      false,
    ) ?? []
  );
};

const owner = { isOwner: true };
const admin = { isAdmin: true };

describe("UsersStore - editing another account", () => {
  it("Owner on a User: email and password, not the name", () => {
    const options = optionsFor(owner, {});

    expect(options).toEqual(
      expect.arrayContaining(["change-email", "change-password"]),
    );
    expect(options).not.toContain("change-name");
  });

  it("DocSpace admin on a Room admin: email and password", () => {
    expect(optionsFor(admin, { role: EmployeeType.RoomAdmin })).toEqual(
      expect.arrayContaining(["change-email", "change-password"]),
    );
  });

  it.each([
    ["SSO", { sso: true }],
    ["LDAP", { ldap: true }],
  ])("%s account: no email or password change", (_, flags) => {
    const options = optionsFor(owner, flags);

    expect(options).not.toContain("change-email");
    expect(options).not.toContain("change-password");
  });

  it("Own row: name, email and password", () => {
    expect(optionsFor(admin, { isMySelf: true })).toEqual(
      expect.arrayContaining(["change-name", "change-email", "change-password"]),
    );
  });

  it("DocSpace admin on another DocSpace admin: no edits", () => {
    const options = optionsFor(admin, { role: EmployeeType.Admin });

    expect(options).not.toContain("change-email");
    expect(options).not.toContain("change-password");
  });
});

describe("UsersStore - account menu by status", () => {
  it("Pending account: Invite again", () => {
    expect(optionsFor(admin, { statusType: "pending" })).toContain(
      "invite-again",
    );
  });

  it("Guest of an administrator: share and change type", () => {
    expect(optionsFor(owner, { role: EmployeeType.Guest })).toEqual(
      expect.arrayContaining(["share-guest", "change-type"]),
    );
  });

  it("Room admin on their guest: room list, share, change type, remove", () => {
    expect(
      optionsFor({ isRoomAdmin: true }, { role: EmployeeType.Guest }),
    ).toEqual(
      expect.arrayContaining([
        "room-list",
        "share-guest",
        "change-type",
        "remove-guest",
      ]),
    );
  });

  it("Administrator: the account's rooms are offered", () => {
    expect(optionsFor(admin, {})).toContain("room-list");
  });

  it("Disabled account: enable, reassign and delete; a guest is not reassigned", () => {
    expect(optionsFor(owner, { statusType: "disabled" })).toEqual(
      expect.arrayContaining(["enable", "reassign-data", "delete-user"]),
    );
    expect(
      optionsFor(owner, { statusType: "disabled", role: EmployeeType.Guest }),
    ).not.toContain("reassign-data");
  });
});
