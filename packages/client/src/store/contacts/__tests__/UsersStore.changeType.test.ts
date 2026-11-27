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

const reassignmentNecessary = vi.fn();

vi.mock("@docspace/shared/api/people", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  reassignmentNecessary: (...args: unknown[]) => reassignmentNecessary(...args),
}));
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

import { EmployeeType, Events } from "@docspace/shared/enums";

import UsersStore from "../UsersStore";

type TStoreArgs = ConstructorParameters<typeof UsersStore>;

const setDialogData = vi.fn();

const makeStore = () =>
  new UsersStore(
    ...([
      {},
      { user: { id: "me" } },
      {},
      {},
      {},
      { setDialogData },
      {},
      {},
      {},
      {},
      {},
    ] as unknown as TStoreArgs),
  );

const account = (id: string, role: EmployeeType, displayName = id) =>
  ({ id, role, displayName }) as unknown as UsersStore["getUsersToMakeEmployees"][number];

let dispatched: Event[];
const onEvent = (event: Event) => dispatched.push(event);

beforeEach(() => {
  dispatched = [];
  window.addEventListener(Events.CHANGE_USER_TYPE, onEvent);
  reassignmentNecessary.mockResolvedValue(false);
});

afterEach(() => {
  window.removeEventListener(Events.CHANGE_USER_TYPE, onEvent);
});

describe("UsersStore - changing an account's type", () => {
  it("Same type chosen: nothing is asked", async () => {
    const result = await makeStore().changeType(EmployeeType.RoomAdmin, [
      account("a", EmployeeType.RoomAdmin),
    ]);

    expect(result).toBe(false);
    expect(setDialogData).not.toHaveBeenCalled();
    expect(dispatched).toHaveLength(0);
  });

  it("Raised to Room admin: confirmation, the server is not asked about the data", async () => {
    const result = await makeStore().changeType(EmployeeType.RoomAdmin, [
      account("a", EmployeeType.User),
    ]);

    expect(result).toBe(true);
    expect(reassignmentNecessary).not.toHaveBeenCalled();
    expect(setDialogData).toHaveBeenCalledWith(
      expect.objectContaining({
        toType: EmployeeType.RoomAdmin,
        fromType: [EmployeeType.User],
        userIDs: ["a"],
        needReassignData: false,
      }),
    );
    expect(dispatched).toHaveLength(1);
  });

  it("Lowered to User with data to pass on: the change runs as a reassignment", async () => {
    reassignmentNecessary.mockResolvedValue(true);

    await makeStore().changeType(EmployeeType.User, [
      account("a", EmployeeType.RoomAdmin),
    ]);

    expect(reassignmentNecessary).toHaveBeenCalledWith("a", EmployeeType.User);
    expect(setDialogData).toHaveBeenCalledWith(
      expect.objectContaining({
        toType: EmployeeType.User,
        needReassignData: true,
        reassignUserData: expect.any(Function),
        getReassignmentProgress: expect.any(Function),
        cancelReassignment: expect.any(Function),
      }),
    );
    expect(dispatched).toHaveLength(1);
  });

  it("Lowered to Guest: the server is asked about the data", async () => {
    await makeStore().changeType(EmployeeType.Guest, [
      account("a", EmployeeType.User),
    ]);

    expect(reassignmentNecessary).toHaveBeenCalledWith("a", EmployeeType.Guest);
  });

  it("Several accounts: those of the chosen type are left out", async () => {
    await makeStore().changeType(EmployeeType.RoomAdmin, [
      account("a", EmployeeType.User, "Ann"),
      account("b", EmployeeType.RoomAdmin, "Bob"),
      account("c", EmployeeType.Guest, "Cid"),
    ]);

    expect(setDialogData).toHaveBeenCalledWith(
      expect.objectContaining({
        fromType: [EmployeeType.User, EmployeeType.Guest],
        userIDs: ["a", "c"],
        userNames: ["Ann", "Cid"],
      }),
    );
  });

  it("Raised from Guest: no reassignment is offered", async () => {
    await makeStore().changeType(EmployeeType.User, [
      account("a", EmployeeType.Guest),
    ]);

    const [data] = setDialogData.mock.calls[0];
    expect(data.fromType).toEqual([EmployeeType.Guest]);
    expect(data).not.toHaveProperty("reassignUserData");
    expect(data).not.toHaveProperty("needReassignData");
  });
});
