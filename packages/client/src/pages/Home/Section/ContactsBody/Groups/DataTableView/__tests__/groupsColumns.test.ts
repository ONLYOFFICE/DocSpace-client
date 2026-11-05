import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import type { TGroup } from "@docspace/shared/api/groups/types";

import {
  MANAGER_COLUMN,
  MEMBERS_COLUMN,
  getGroupsColumns,
  groupsColumnsRecord,
} from "../groupsColumns";

// What is under test is which column each cell sits in, not the cells.
vi.mock("../GroupsCells", () => ({
  NameCell: () => null,
  MembersCell: () => null,
  ManagerCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

const ALL_ON = { [MEMBERS_COLUMN]: true, [MANAGER_COLUMN]: true };

describe("groups columns", () => {
  it("are the old header's columns, then the settings", () => {
    expect(getGroupsColumns(t, ALL_ON).map((column) => column.id)).toEqual([
      "Name",
      "People",
      "Head of Group",
      "Settings",
    ]);
  });

  it("show a column by its tableStore flag, and the title always", () => {
    const columns = getGroupsColumns(t, { ...ALL_ON, [MEMBERS_COLUMN]: false });
    const column = (id: string) => columns.find((c) => c.id === id);

    expect(column("Name")?.visible).not.toBe(false);
    expect(column("Name")?.hideable).toBeFalsy();
    expect(column(MEMBERS_COLUMN)?.visible).toBe(false);
    expect(column(MANAGER_COLUMN)?.visible).toBe(true);
    expect(column(MANAGER_COLUMN)?.hideable).toBe(true);
  });

  it("sort by the groups filter's keys", () => {
    expect(
      getGroupsColumns(t, ALL_ON).map((column) => [column.id, column.sortKey]),
    ).toEqual([
      ["Name", "title"],
      ["People", "membersCount"],
      ["Head of Group", "manager"],
      ["Settings", undefined],
    ]);
  });

  it("give the cells the old row's test ids and classes", () => {
    const row = {} as TGroup;
    expect(
      getGroupsColumns(t, ALL_ON)
        .filter((column) => column.cellTestId)
        .map((column) => [column.cellTestId!(row, 2), column.cellClassName]),
    ).toEqual([
      [
        "contacts_table_groups_title_cell_2",
        "table-container_group-title-cell",
      ],
      [
        "contacts_table_groups_members_count_cell_2",
        "table-container_group-people",
      ],
      ["contacts_table_groups_manager_cell_2", "table-container_group-manager"],
    ]);
  });

  it("store the visible columns as the old header did: off is `false`", () => {
    expect(groupsColumnsRecord(ALL_ON)).toBe("Name,People,Head of Group");
    expect(groupsColumnsRecord({ ...ALL_ON, [MEMBERS_COLUMN]: false })).toBe(
      "Name,false,Head of Group",
    );
  });
});
