import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import { SortByFieldName } from "@docspace/shared/enums";

import {
  getUsersColumns,
  usersColumnsRecord,
  type TUsersColumnsOptions,
} from "../usersColumns";
import type { TItem } from "../UsersDataTableView.types";

// The cells are the old row's components behind withPeopleContent; what is
// under test is which column each one sits in.
vi.mock("../UsersCells", () => ({
  NameCell: () => null,
  TypeCell: () => null,
  GroupsCell: () => null,
  EmailCell: () => null,
  InviterCell: () => null,
  InvitedDateCell: () => null,
  StorageCell: () => null,
  AISpendingCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

const ALL_ON = {
  Type: true,
  Department: true,
  Mail: true,
  Storage: true,
  AISpending: true,
  Inviter: true,
  InvitedDate: true,
};

const options = (
  overrides: Partial<TUsersColumnsOptions> = {},
): TUsersColumnsOptions => ({
  t,
  tab: "people",
  flags: ALL_ON,
  showStorageInfo: true,
  showAISpendingInfo: true,
  isDefaultUsersQuotaSet: false,
  isRoomAdmin: false,
  ...overrides,
});

const ids = (opts: TUsersColumnsOptions) =>
  getUsersColumns(opts).map((column) => column.id);

describe("users columns", () => {
  it("are the old header's columns of each tab, then the settings", () => {
    expect(ids(options())).toEqual([
      "Name",
      "Type",
      "Department",
      "Mail",
      "Storage",
      "AISpending",
      "Settings",
    ]);
    expect(ids(options({ tab: "inside_group" }))).toEqual(
      ids(options({ tab: "people" })),
    );
    expect(ids(options({ tab: "guests" }))).toEqual([
      "Name",
      "Mail",
      "Inviter",
      "InvitedDate",
      "Settings",
    ]);
  });

  it("leave out what the portal or the viewer does not have", () => {
    expect(
      ids(options({ showStorageInfo: false, showAISpendingInfo: false })),
    ).toEqual(["Name", "Type", "Department", "Mail", "Settings"]);
    // A room admin sees neither who invited a guest nor when.
    expect(ids(options({ tab: "guests", isRoomAdmin: true }))).toEqual([
      "Name",
      "Mail",
      "Settings",
    ]);
  });

  it("show a column by its tableStore flag, and the name always", () => {
    const columns = getUsersColumns(
      options({ flags: { ...ALL_ON, Department: false } }),
    );
    const visible = (id: string) =>
      columns.find((column) => column.id === id)?.visible !== false;

    expect(visible("Name")).toBe(true);
    expect(visible("Department")).toBe(false);
    expect(visible("Mail")).toBe(true);
    expect(
      columns.find((column) => column.id === "Name")?.hideable,
    ).toBeFalsy();
    expect(columns.find((column) => column.id === "Mail")?.hideable).toBe(true);
  });

  it("sort by the people filter's keys; AI spending does not sort", () => {
    expect(
      getUsersColumns(options()).map((column) => [column.id, column.sortKey]),
    ).toEqual([
      ["Name", "AZ"],
      ["Type", "type"],
      ["Department", "department"],
      ["Mail", "email"],
      ["Storage", SortByFieldName.UsedSpace],
      ["AISpending", undefined],
      ["Settings", undefined],
    ]);
  });

  it("call the storage column by the quota", () => {
    const title = (isDefaultUsersQuotaSet: boolean) =>
      getUsersColumns(options({ isDefaultUsersQuotaSet })).find(
        (column) => column.id === "Storage",
      )?.title;

    expect(title(true)).toBe("Common:StorageAndQuota");
    expect(title(false)).toBe("Common:Storage");
  });

  it("give the cells the old row's test ids and classes", () => {
    const row = {} as TItem;
    expect(
      getUsersColumns(options({ tab: "guests" }))
        .filter((column) => column.cellTestId)
        .map((column) => [column.cellTestId!(row, 3), column.cellClassName]),
    ).toEqual([
      ["contacts_name_cell_3", "table-container_user-name-cell"],
      ["contacts_email_cell_3", "table-cell_email"],
      ["contacts_inviter_cell_3", "table-cell_inviter"],
      ["contacts_invited_date_cell_3", "table-cell_invited-date"],
    ]);
  });

  it("store the visible columns as the old header did: the keys that are on", () => {
    expect(
      usersColumnsRecord(options(), { ...ALL_ON, Department: false }),
    ).toBe("Name,Type,Mail,Storage,AISpending");
    // A column the tab does not have is never stored.
    expect(usersColumnsRecord(options({ tab: "guests" }), ALL_ON)).toBe(
      "Name,Mail,Inviter,InvitedDate",
    );
  });
});
