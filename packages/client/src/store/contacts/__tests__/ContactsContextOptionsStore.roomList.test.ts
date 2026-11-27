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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { FilterSubject } from "@docspace/shared/enums";

import ContactsContextOptionsStore from "../ContactsContextOptionsStore";

type TStoreArgs = ConstructorParameters<typeof ContactsContextOptionsStore>;
type TItem = Parameters<ContactsContextOptionsStore["openUserRoomList"]>[0];

const makeStore = (isDesktopClient = false) =>
  new ContactsContextOptionsStore(
    ...([
      {},
      { user: { id: "me" } },
      {},
      { isDesktopClient },
      {},
      {},
      {},
      {},
      {},
      {},
    ] as unknown as TStoreArgs),
  );

let open: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  open = vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  open.mockRestore();
});

const openedFilter = () => {
  const [url] = open.mock.calls[0] as [string, string];
  const [path, query] = url.split("?");
  return { path, filter: RoomsFilter.getFilter({ search: `?${query}` } as Location) };
};

describe("Rooms of an account", () => {
  it("opens the Rooms section in a new tab, filtered to the rooms the account is a member of", () => {
    makeStore().openUserRoomList({ id: "u1" } as TItem);

    expect(open).toHaveBeenCalledWith(expect.stringContaining("/rooms/shared"), "_blank");
    const { filter } = openedFilter();
    expect(filter?.subjectId).toBe("u1");
    expect(String(filter?.subjectFilter)).toBe(String(FilterSubject.Member));
  });

  it("stays in the same window of the desktop app", () => {
    makeStore(true).openUserRoomList({ id: "u1" } as TItem);

    expect(open).toHaveBeenCalledWith(expect.any(String), "_self");
  });
});
