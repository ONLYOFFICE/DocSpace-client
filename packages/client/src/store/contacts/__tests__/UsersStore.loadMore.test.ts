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

import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api", async (importOriginal) => {
  const actual = (await importOriginal()) as { default: Record<string, object> };
  return {
    ...actual,
    default: {
      ...actual.default,
      people: { ...actual.default.people, getUserList },
    },
  };
});
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

import Filter from "@docspace/shared/api/people/filter";
import type { TUser } from "@docspace/shared/api/people/types";

import UsersStore from "../UsersStore";

type TStoreArgs = ConstructorParameters<typeof UsersStore>;

const user = (id: string) => ({ id, displayName: id, email: `${id}@x` }) as TUser;

const makeStore = (loaded: TUser[], total: number, isLoading = false) => {
  const store = new UsersStore(
    ...([
      {},
      { user: { id: "me", isAdmin: true } },
      {},
      {},
      {},
      {},
      { isLoading },
      {},
      {},
      {},
      {},
    ] as unknown as TStoreArgs),
  );
  const filter = Filter.getDefault();
  filter.total = total;
  store.setFilter(filter);
  store.setUsers(loaded);
  return store;
};

beforeEach(() => {
  window.DocSpace = {
    ...window.DocSpace,
    location: { pathname: "/accounts/people" },
  } as typeof window.DocSpace;
  getUserList.mockResolvedValue({ items: [user("c"), user("d")] });
});

describe("Loading more accounts on scroll", () => {
  it("asks for the next page and appends it", async () => {
    const store = makeStore([user("a"), user("b")], 4);

    await store.fetchMoreUsers();

    const [requested] = getUserList.mock.calls[0];
    expect(requested.page).toBe(1);
    expect(store.users.map(({ id }) => id)).toEqual(["a", "b", "c", "d"]);
    expect(store.isUsersLoading).toBe(false);
  });

  it("asks for nothing once every account is listed", async () => {
    const store = makeStore([user("a"), user("b")], 2);

    await store.fetchMoreUsers();

    expect(getUserList).not.toHaveBeenCalled();
  });

  it("asks for nothing while the list is loading", async () => {
    const store = makeStore([user("a")], 4, true);

    await store.fetchMoreUsers();

    expect(getUserList).not.toHaveBeenCalled();
  });
});
