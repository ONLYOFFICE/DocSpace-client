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

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";

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

import UsersFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import { EmployeeStatus, FilterGroups } from "@docspace/shared/enums";

import { useContactsFilter } from "../useContacts";

type TProps = Parameters<typeof useContactsFilter>[0];

const QUOTA_ITEM = { key: "quota", group: "filter-quota", label: "quota" };

const render = (overrides: Partial<TProps>) => {
  const props = {
    contactsTab: "people",
    usersFilter: UsersFilter.getDefault(),
    setUsersFilter: vi.fn(),
    groupsFilter: GroupsFilter.getDefault(),
    setGroupsFilter: vi.fn(),
    userId: "me",
    t: (key: string) => key,
    isRoomAdmin: false,
    standalone: false,
    showStorageInfo: false,
    isDefaultUsersQuotaSet: false,
    groupsStore: {},
    usersStore: {},
    ...overrides,
  } as TProps;

  return renderHook(() => useContactsFilter(props), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  }).result.current;
};

const sortKeys = (overrides: Partial<TProps>) =>
  (render(overrides).getContactsSortData() as { key: string }[]).map(
    ({ key }) => key,
  );

const filterGroups = (overrides: Partial<TProps>) => [
  ...new Set(
    (
      render(overrides).getContactsFilterData([QUOTA_ITEM] as never) as {
        group: string;
      }[]
    ).map(({ group }) => group),
  ),
];

const filterKeys = (overrides: Partial<TProps>) =>
  (
    render(overrides).getContactsFilterData([QUOTA_ITEM] as never) as {
      key: string | number;
    }[]
  ).map(({ key }) => key);

describe("Sorting the lists", () => {
  it("Members: name, type, group, email", () => {
    expect(sortKeys({})).toEqual(["displayname", "type", "department", "email"]);
  });

  it("Members where storage is shown: storage as well", () => {
    expect(sortKeys({ showStorageInfo: true })).toHaveLength(5);
  });

  it("Guests: name, email, inviter, registration date", () => {
    expect(sortKeys({ contactsTab: "guests" })).toEqual([
      "displayname",
      "email",
      "createdby",
      "registrationDate",
    ]);
  });

  it("Guests of a Room admin: no inviter", () => {
    expect(sortKeys({ contactsTab: "guests", isRoomAdmin: true })).toEqual([
      "displayname",
      "email",
      "registrationDate",
    ]);
  });

  it("Groups: title, members, head of group", () => {
    expect(sortKeys({ contactsTab: "groups" })).toEqual([
      "title",
      "membersCount",
      "manager",
    ]);
  });
});

describe("Filtering the lists", () => {
  it("Members on SaaS: group, status, type, account, login type", () => {
    expect(filterGroups({})).toEqual([
      FilterGroups.filterGroup,
      "filter-status",
      "filter-type",
      "filter-account",
      "filter-login-type",
    ]);
  });

  it("Members on a server installation: no paid or free account", () => {
    expect(filterGroups({ standalone: true })).not.toContain("filter-account");
  });

  it("Members with storage shown and a default quota: storage as well", () => {
    expect(
      filterGroups({ showStorageInfo: true, isDefaultUsersQuotaSet: true }),
    ).toContain("filter-quota");
    expect(filterGroups({ showStorageInfo: true })).not.toContain(
      "filter-quota",
    );
  });

  it("Guests: inviter, status, login type", () => {
    expect(filterGroups({ contactsTab: "guests" })).toEqual([
      FilterGroups.filterInviter,
      "filter-status",
      "filter-login-type",
    ]);
  });

  it("Room admin: no inviter and no disabled status", () => {
    expect(
      filterGroups({ contactsTab: "guests", isRoomAdmin: true }),
    ).not.toContain(FilterGroups.filterInviter);
    expect(filterKeys({ isRoomAdmin: true })).not.toContain(
      EmployeeStatus.Disabled,
    );
    expect(filterKeys({})).toContain(EmployeeStatus.Disabled);
  });

  it("Groups: member and head-of-group search", () => {
    expect(filterGroups({ contactsTab: "groups" })).toEqual([
      FilterGroups.groupsFilterMember,
      FilterGroups.groupsFilterManager,
    ]);
  });
});
