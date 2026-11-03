import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import {
  FILES_COLUMN_FLAG,
  filesColumnsRecord,
  getFilesColumns,
} from "../columns/filesColumns";
import type {
  TFilesColumnsOptions,
  TFilesTableItem,
} from "../DataTableView.types";

// The installed ui-kit package predates the DataTable, so the client's own
// test run cannot resolve it; the two column helpers are all this file needs.
vi.mock("@onlyoffice/apps-ui-kit/components/data-table", () => ({
  settingsColumn: () => ({
    id: "Settings",
    width: { type: "fixed", size: 24 },
  }),
  contextMenuColumn: () => ({
    id: "ContextMenu",
    width: { type: "fixed", size: 24 },
  }),
}));

// The cells are the old table's components behind the row HOCs; what is under
// test is which column each one sits in.
vi.mock("../cells/FilesCells", () => ({
  NameCell: () => null,
  AuthorColumnCell: () => null,
  DateColumnCell: () => null,
  ErasureColumnCell: () => null,
  SizeColumnCell: () => null,
  TypeColumnCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

const options = (
  overrides: Partial<TFilesColumnsOptions> = {},
): TFilesColumnsOptions => ({
  t,
  sideColor: "side",
  isPublicRoom: false,
  isPersonalReadOnly: false,
  showSettings: true,
  flags: {
    author: false,
    created: false,
    modified: true,
    erasure: true,
    size: true,
    type: false,
  },
  ...overrides,
});

const ids = (opts: TFilesColumnsOptions) =>
  getFilesColumns(opts).map((column) => column.id);

describe("files columns", () => {
  it("are the documents columns of the old table, then the settings column", () => {
    expect(ids(options())).toEqual([
      "Name",
      "Author",
      "Created",
      "Modified",
      "Size",
      "Type",
      "Settings",
    ]);
  });

  it("drop the author in a public room", () => {
    expect(ids(options({ isPublicRoom: true }))).not.toContain("Author");
  });

  it("add the erasure date in read-only My documents", () => {
    expect(ids(options({ isPersonalReadOnly: true }))).toEqual([
      "Name",
      "Author",
      "Created",
      "Modified",
      "Erasure",
      "Size",
      "Type",
      "Settings",
    ]);
  });

  it("keep the row menu without the column settings when the frame hides them", () => {
    expect(ids(options({ showSettings: false })).at(-1)).toBe("ContextMenu");
  });

  it("take their visibility from the tableStore flags", () => {
    const visible = Object.fromEntries(
      getFilesColumns(options()).map((column) => [column.id, column.visible]),
    );

    expect(visible).toMatchObject({
      Author: false,
      Created: false,
      Modified: true,
      Size: true,
      Type: false,
    });
  });

  it("let every column but the name be hidden", () => {
    const hideable = getFilesColumns(options({ isPersonalReadOnly: true }))
      .filter((column) => column.hideable)
      .map((column) => column.id);

    expect(hideable).toEqual(Object.keys(FILES_COLUMN_FLAG));
  });

  it("sort by the same columns the old header sorted by", () => {
    const sortable = getFilesColumns(options({ isPersonalReadOnly: true }))
      .filter((column) => column.sortKey)
      .map((column) => [column.id, column.sortKey]);

    expect(sortable).toEqual([
      ["Name", "AZ"],
      ["Modified", "DateAndTime"],
      ["Erasure", "DateAndTime"],
      ["Size", "Size"],
    ]);
  });

  it("give their cells the old table's test ids", () => {
    const row = {} as TFilesTableItem;
    const testIds = getFilesColumns(options({ isPersonalReadOnly: true }))
      .filter((column) => column.cellTestId)
      .map((column) => column.cellTestId?.(row, 3));

    expect(testIds).toEqual([
      "files-cell-name-3",
      "files-cell-author-3",
      "files-cell-created-3",
      "files-cell-modified-3",
      "files-cell-erasure-3",
      "files-cell-size-3",
      "files-cell-type-3",
    ]);
  });

  it("mark the name cell with the old table's class", () => {
    const [name] = getFilesColumns(options());

    expect(name.cellClassName).toBe("table-container_file-name-cell");
  });

  it("give the name the remaining width and every other column a share", () => {
    const widths = getFilesColumns(options())
      .slice(0, -1)
      .map((column) => column.width.type);

    expect(widths).toEqual(["fill", "flex", "flex", "flex", "flex", "flex"]);
  });
});

describe("the visible-columns record", () => {
  // `columns.map((c) => c.enable && c.key)` in the old header, written as a string.
  it("has the old header's shape: false for a hidden column", () => {
    expect(filesColumnsRecord(options().flags, options())).toBe(
      "Name,false,false,Modified,,Size,false",
    );
  });

  it("keeps an empty slot for a column the section does not have", () => {
    const opts = options({ isPublicRoom: true, isPersonalReadOnly: true });

    expect(filesColumnsRecord(opts.flags, opts)).toBe(
      "Name,,false,Modified,Erasure,Size,false",
    );
  });

  it("is read back by the store's column lookup", () => {
    const record = filesColumnsRecord(options().flags, options()).split(",");

    expect(record.filter((key) => key && key !== "false")).toEqual([
      "Name",
      "Modified",
      "Size",
    ]);
  });
});
