import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import {
  filesColumnsRecord,
  findSectionColumn,
  getFilesColumns,
} from "../columns/filesColumns";
import { SECTIONS, readColumnFlags } from "../columns/sections";
import type {
  TFilesColumnsOptions,
  TFilesTableItem,
} from "../DataTableView.types";
import TableStore from "SRC_DIR/store/TableStore";

// The installed ui-kit package predates the DataTable, so the client's own
// test run cannot resolve it; the two column helpers are all this file needs.
vi.mock("@onlyoffice/apps-ui-kit/components/data-table", () => ({
  DATA_TABLE_SETTINGS_WIDTH: 24,
  // What the options asked for, kept on the column so a test can read it.
  settingsColumn: (settings: object) => ({
    id: "Settings",
    width: { type: "fixed", size: 24 },
    settings,
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
  AccessLevelColumnCell: () => null,
  AuthorColumnCell: () => null,
  DateColumnCell: () => null,
  ErasureColumnCell: () => null,
  IndexColumnCell: () => null,
  LastOpenedColumnCell: () => null,
  LocationColumnCell: () => null,
  QuotaColumnCell: () => null,
  SharedByColumnCell: () => null,
  SizeColumnCell: () => null,
  TagsColumnCell: () => null,
  TypeColumnCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

const FILES_FLAGS = {
  Author: false,
  Created: false,
  Modified: true,
  Erasure: true,
  Size: true,
  Type: false,
};

const options = (
  overrides: Partial<TFilesColumnsOptions> = {},
): TFilesColumnsOptions => ({
  t,
  sideColor: "side",
  isPublicRoom: false,
  isPersonalReadOnly: false,
  showSettings: true,
  indexColumnSize: 37,
  isIndexEditingMode: false,
  showStorageInfo: false,
  isDefaultRoomsQuotaSet: false,
  isArchiveFolder: false,
  tagsHeaderRef: () => {},
  flags: FILES_FLAGS,
  ...overrides,
});

const files = SECTIONS.files;

const ids = (opts: TFilesColumnsOptions, section = files) =>
  getFilesColumns(section, opts).map((column) => column.id);

const sortable = (opts: TFilesColumnsOptions, section = files) =>
  getFilesColumns(section, opts)
    .filter((column) => column.sortKey)
    .map((column) => [column.id, column.sortKey, column.sortable !== false]);

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
      getFilesColumns(files, options()).map((column) => [
        column.id,
        column.visible,
      ]),
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
    const hideable = getFilesColumns(
      files,
      options({ isPersonalReadOnly: true }),
    )
      .filter((column) => column.hideable)
      .map((column) => column.id);

    expect(hideable).toEqual(files.columns.map((column) => column.id));
  });

  it("sort from the headers the old header sorted from, and show every sort it knew", () => {
    expect(sortable(options({ isPersonalReadOnly: true }))).toEqual([
      ["Name", "AZ", true],
      ["Author", "Author", false],
      ["Created", "DateAndTimeCreation", false],
      ["Modified", "DateAndTime", true],
      ["Erasure", "DateAndTime", true],
      ["Size", "Size", true],
      ["Type", "Type", false],
    ]);
  });

  it("give their cells the old table's test ids", () => {
    const row = {} as TFilesTableItem;
    const testIds = getFilesColumns(
      files,
      options({ isPersonalReadOnly: true }),
    )
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
    const [name] = getFilesColumns(files, options());

    expect(name.cellClassName).toBe("table-container_file-name-cell");
  });

  it("give the name the remaining width and every other column a share", () => {
    const widths = getFilesColumns(files, options())
      .slice(0, -1)
      .map((column) => column.width.type);

    expect(widths).toEqual(["fill", "flex", "flex", "flex", "flex", "flex"]);
  });

  it("mark the cells of the last visible column, as the old rows did", () => {
    const lastClass = (flags: Record<string, boolean>) =>
      getFilesColumns(files, options({ flags }))
        .filter((column) => column.cellClassName === "no-extra-space")
        .map((column) => column.id);

    expect(lastClass(FILES_FLAGS)).toEqual(["Size"]);
    expect(lastClass({ ...FILES_FLAGS, Type: true })).toEqual(["Type"]);
    expect(lastClass({})).toEqual([]);
  });
});

describe("shared with me columns", () => {
  const row = {} as TFilesTableItem;
  const testIdsOf = (
    section: (typeof SECTIONS)[keyof typeof SECTIONS],
    opts = options({ flags: {} }),
  ) =>
    getFilesColumns(section, opts).map((column) => [
      column.id,
      column.cellTestId?.(row, 0),
    ]);

  it("are the old shared header's columns, with its test ids", () => {
    expect(testIdsOf(SECTIONS.sharedWithMe)).toEqual([
      ["Name", "shared-with-me-cell-name-0"],
      ["SharedByShareWithMe", "shared-with-me-cell-shared-by-0"],
      ["AuthorShareWithMe", "shared-with-me-cell-author-0"],
      ["AccessLevelShareWithMe", "shared-with-me-cell-access-level-0"],
      ["ModifiedShareWithMe", "shared-with-me-cell-modified-0"],
      ["SizeShareWithMe", "shared-with-me-cell-size-0"],
      ["TypeShareWithMe", "shared-with-me-cell-type-0"],
      ["Settings", undefined],
    ]);
  });

  it("drop who shared an item inside a shared folder", () => {
    expect(testIdsOf(SECTIONS.inSharedFolder).map(([id]) => id)).not.toContain(
      "SharedByShareWithMe",
    );
  });

  it("drop who shared and the author in a public room", () => {
    const ids = testIdsOf(
      SECTIONS.sharedWithMe,
      options({ flags: {}, isPublicRoom: true }),
    ).map(([id]) => id);

    expect(ids).not.toContain("SharedByShareWithMe");
    expect(ids).not.toContain("AuthorShareWithMe");
  });

  it("sort by name, modification and size from the header", () => {
    for (const section of [SECTIONS.sharedWithMe, SECTIONS.inSharedFolder]) {
      expect(sortable(options(), section)).toEqual([
        ["Name", "AZ", true],
        ["ModifiedShareWithMe", "DateAndTime", true],
        ["SizeShareWithMe", "Size", true],
      ]);
    }
  });
});

describe("VDR columns", () => {
  const vdr = SECTIONS.vdrIndexing;
  const row = {} as TFilesTableItem;
  const VDR_FLAGS = {
    AuthorIndexing: true,
    CreatedIndexing: false,
    ModifiedIndexing: true,
    SizeIndexing: true,
    TypeIndexing: false,
  };
  const vdrOptions = (overrides: Partial<TFilesColumnsOptions> = {}) =>
    options({ flags: VDR_FLAGS, ...overrides });

  it("start with the order, and keep the old indexing test ids", () => {
    expect(
      getFilesColumns(vdr, vdrOptions()).map((column) => [
        column.id,
        column.cellTestId?.(row, 2),
      ]),
    ).toEqual([
      ["Index", "index_cell_order_2"],
      ["Name", "index_cell_name_2"],
      ["AuthorIndexing", "index_cell_author_2"],
      ["CreatedIndexing", "index_cell_created_2"],
      ["ModifiedIndexing", "index_cell_modified_2"],
      ["SizeIndexing", "index_cell_size_2"],
      ["TypeIndexing", "index_cell_type_2"],
      ["Settings", undefined],
    ]);
  });

  it("give the order a fixed column as wide as the longest order, never hidden", () => {
    const [index] = getFilesColumns(vdr, vdrOptions({ indexColumnSize: 41 }));

    expect(index.width).toEqual({ type: "fixed", size: 41 });
    expect(index.hideable).toBeFalsy();
    expect(index.cellClassName).toBe("table-container_index-cell");
  });

  it("sort nothing from the header", () => {
    expect(sortable(vdrOptions(), vdr)).toEqual([]);
  });

  it("let every column be resized until the rows are reordered", () => {
    const resizable = (opts: TFilesColumnsOptions) =>
      getFilesColumns(vdr, opts)
        .filter((column) => column.width.type !== "fixed")
        .map((column) => column.resizable);

    expect(resizable(vdrOptions())).toEqual(Array(6).fill(true));
    expect(resizable(vdrOptions({ isIndexEditingMode: true }))).toEqual(
      Array(6).fill(false),
    );
  });

  it("grey the settings out and drop the row menus while reordering", () => {
    const settingsOf = (opts: TFilesColumnsOptions) =>
      (getFilesColumns(vdr, opts).at(-1) as unknown as { settings: object })
        .settings;

    expect(settingsOf(vdrOptions())).toMatchObject({
      withContextMenu: true,
      disabled: false,
    });
    expect(settingsOf(vdrOptions({ isIndexEditingMode: true }))).toMatchObject({
      withContextMenu: false,
      disabled: true,
    });
  });

  it("keep an empty last column in a frame without settings while reordering", () => {
    const last = getFilesColumns(
      vdr,
      vdrOptions({ showSettings: false, isIndexEditingMode: true }),
    ).at(-1);

    expect(last?.id).toBe("ContextMenu");
    expect(last?.cell(row, { index: 0, isLast: false, compact: false })).toBe(
      null,
    );
  });

  it("mark the cell that holds the reorder arrows, as the old rows did", () => {
    const classes = (opts: TFilesColumnsOptions) =>
      Object.fromEntries(
        getFilesColumns(vdr, opts)
          .filter((column) => column.cellClassName)
          .map((column) => [column.id, column.cellClassName]),
      );

    expect(classes(vdrOptions({ isIndexEditingMode: true }))).toEqual({
      Index: "table-container_index-cell",
      Name: "table-container_file-name-cell",
      SizeIndexing: "no-extra-space index-buttons",
    });
    // With Name alone the arrows sit at its end.
    expect(
      classes(vdrOptions({ isIndexEditingMode: true, flags: {} })).Name,
    ).toBe("table-container_file-name-cell index-buttons-name");
  });

  it("put the order first in the visible-columns record", () => {
    expect(filesColumnsRecord(vdr, VDR_FLAGS, vdrOptions())).toBe(
      "Index,Name,AuthorIndexing,false,ModifiedIndexing,SizeIndexing,false",
    );
  });
});

describe("rooms and templates columns", () => {
  const row = {} as TFilesTableItem;
  const ROOM_FLAGS = {
    Type: true,
    Tags: true,
    Owner: false,
    Activity: true,
    Storage: true,
  };
  const roomOptions = (overrides: Partial<TFilesColumnsOptions> = {}) =>
    options({ flags: ROOM_FLAGS, showStorageInfo: true, ...overrides });

  it("are the old rooms header's columns, with its test ids", () => {
    expect(
      getFilesColumns(SECTIONS.rooms, roomOptions()).map((column) => [
        column.id,
        column.title,
        column.cellTestId?.(row, 0),
      ]),
    ).toEqual([
      ["Name", "Common:Label", "rooms-cell-name-0"],
      ["Type", "Common:Type", "rooms-cell-type-0"],
      ["Tags", "Common:Tags", "rooms-cell-tags-0"],
      ["Owner", "Common:Owner", "rooms-cell-owner-0"],
      ["Activity", "LastActivity", "rooms-cell-activity-0"],
      ["Storage", "Common:Storage", "rooms-cell-storage-0"],
      ["Settings", undefined, undefined],
    ]);
  });

  it("are the old templates header's columns under their own keys", () => {
    expect(
      getFilesColumns(SECTIONS.templates, roomOptions()).map((column) => [
        column.id,
        column.cellTestId?.(row, 0),
      ]),
    ).toEqual([
      ["Name", "templates-cell-name-0"],
      ["TypeTemplates", "templates-cell-type-0"],
      ["TagsTemplates", "templates-cell-tags-0"],
      ["OwnerTemplates", "templates-cell-owner-0"],
      ["ActivityTemplates", "templates-cell-activity-0"],
      ["StorageTemplates", "templates-cell-storage-0"],
      ["Settings", undefined],
    ]);
  });

  it("sort by every column from the header", () => {
    expect(sortable(roomOptions(), SECTIONS.rooms)).toEqual([
      ["Name", "AZ", true],
      ["Type", "roomType", true],
      ["Tags", "Tags", true],
      ["Owner", "Author", true],
      ["Activity", "DateAndTime", true],
      ["Storage", "usedspace", true],
    ]);
  });

  it("name Storage after the quota, outside the archive", () => {
    const storageTitle = (opts: TFilesColumnsOptions) =>
      getFilesColumns(SECTIONS.rooms, opts).find(
        (column) => column.id === "Storage",
      )?.title;

    expect(storageTitle(roomOptions({ isDefaultRoomsQuotaSet: true }))).toBe(
      "Common:StorageAndQuota",
    );
    expect(
      storageTitle(
        roomOptions({ isDefaultRoomsQuotaSet: true, isArchiveFolder: true }),
      ),
    ).toBe("Common:Storage");
  });

  it("measure the Tags header cell, and no other", () => {
    const tagsHeaderRef = () => {};
    const measured = getFilesColumns(
      SECTIONS.rooms,
      roomOptions({ tagsHeaderRef }),
    )
      .filter((column) => column.headerRef === tagsHeaderRef)
      .map((column) => column.id);

    expect(measured).toEqual(["Tags"]);
  });

  it("have no Storage, and no slot for it in the record, without storage info", () => {
    const opts = roomOptions({ showStorageInfo: false });

    expect(ids(opts, SECTIONS.rooms)).not.toContain("Storage");
    expect(filesColumnsRecord(SECTIONS.rooms, ROOM_FLAGS, opts)).toBe(
      "Name,Type,Tags,false,Activity",
    );
    expect(filesColumnsRecord(SECTIONS.rooms, ROOM_FLAGS, roomOptions())).toBe(
      "Name,Type,Tags,false,Activity,Storage",
    );
  });

  it("are the rooms lists, sorted through the rooms filter", () => {
    expect(SECTIONS.rooms.rooms).toBe(true);
    expect(SECTIONS.templates.rooms).toBe(true);
    expect(SECTIONS.files.rooms).toBeFalsy();
  });
});

describe("trash, recent and favorites columns", () => {
  const row = {} as TFilesTableItem;
  const testIdsOf = (section: (typeof SECTIONS)[keyof typeof SECTIONS]) =>
    getFilesColumns(section, options({ flags: {} })).map((column) => [
      column.id,
      column.cellTestId?.(row, 0),
    ]);

  it("are the old trash header's columns, with its test ids", () => {
    expect(testIdsOf(SECTIONS.trash)).toEqual([
      ["Name", "trash-cell-name-0"],
      ["Location", "trash-cell-location-0"],
      ["AuthorTrash", "trash-cell-author-0"],
      ["CreatedTrash", "trash-cell-created-0"],
      ["Erasure", "trash-cell-erasure-0"],
      ["SizeTrash", "trash-cell-size-0"],
      ["TypeTrash", "trash-cell-type-0"],
      ["Settings", undefined],
    ]);
  });

  it("are the old recent header's columns, with its test ids", () => {
    expect(testIdsOf(SECTIONS.recent)).toEqual([
      ["Name", "recent-cell-name-0"],
      ["AuthorRecent", "recent-cell-author-0"],
      ["LocationRecent", "recent-cell-location-0"],
      ["LastOpenedRecent", "recent-cell-lastopened-0"],
      ["SizeRecent", "recent-cell-size-0"],
      ["TypeRecent", "recent-cell-type-0"],
      ["Settings", undefined],
    ]);
  });

  it("are the old favorites header's columns, with its test ids", () => {
    expect(testIdsOf(SECTIONS.favorites)).toEqual([
      ["Name", "favorites-cell-name-0"],
      ["AuthorFavorites", "favorites-cell-author-0"],
      ["LocationFavorites", "favorites-cell-location-0"],
      ["ModifiedFavorites", "favorites-cell-modified-0"],
      ["SizeFavorites", "favorites-cell-size-0"],
      ["TypeFavorites", "favorites-cell-type-0"],
      ["Settings", undefined],
    ]);
  });

  it("sort the trash by name, erasure and size from the header", () => {
    expect(sortable(options(), SECTIONS.trash)).toEqual([
      ["Name", "AZ", true],
      ["Location", "Location", false],
      ["AuthorTrash", "Author", false],
      ["CreatedTrash", "DateAndTimeCreation", false],
      ["Erasure", "DateAndTime", true],
      ["SizeTrash", "Size", true],
      ["TypeTrash", "Type", false],
    ]);
  });

  it("sort nothing in recent, and only by modification in favorites", () => {
    expect(sortable(options(), SECTIONS.recent)).toEqual([]);
    expect(sortable(options(), SECTIONS.favorites)).toEqual([
      ["ModifiedFavorites", "DateAndTime", true],
    ]);
  });

  it("have no quick buttons in the trash, as the old trash row had none", () => {
    expect(SECTIONS.trash.quickButtons).toBe(false);
    expect(SECTIONS.recent.quickButtons).toBe(true);
    expect(SECTIONS.favorites.quickButtons).toBe(true);
  });

  it("read each column's flag from tableStore, under the store's own defaults", () => {
    // The flags are plain fields; nothing the store depends on is read here.
    const store = new TableStore(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    expect(readColumnFlags(SECTIONS.recent, store)).toEqual({
      AuthorRecent: true,
      LocationRecent: true,
      LastOpenedRecent: true,
      SizeRecent: false,
      TypeRecent: false,
    });
    expect(readColumnFlags(SECTIONS.trash, store)).toEqual({
      Location: true,
      AuthorTrash: true,
      CreatedTrash: false,
      Erasure: true,
      SizeTrash: true,
      TypeTrash: false,
    });
  });
});

describe("the visible-columns record", () => {
  // `columns.map((c) => c.enable && c.key)` in the old header, written as a string.
  it("has the old header's shape: false for a hidden column", () => {
    expect(filesColumnsRecord(files, FILES_FLAGS, options())).toBe(
      "Name,false,false,Modified,,Size,false",
    );
  });

  it("keeps an empty slot for a column the section does not have", () => {
    const opts = options({ isPublicRoom: true, isPersonalReadOnly: true });

    expect(filesColumnsRecord(files, FILES_FLAGS, opts)).toBe(
      "Name,,false,Modified,Erasure,Size,false",
    );
  });

  it("is read back by the store's column lookup", () => {
    const record = filesColumnsRecord(files, FILES_FLAGS, options()).split(",");

    expect(record.filter((key) => key && key !== "false")).toEqual([
      "Name",
      "Modified",
      "Size",
    ]);
  });

  it("lists the trash's own keys in its order", () => {
    const flags = {
      Location: true,
      AuthorTrash: false,
      CreatedTrash: false,
      Erasure: true,
      SizeTrash: true,
      TypeTrash: false,
    };

    expect(filesColumnsRecord(SECTIONS.trash, flags, options())).toBe(
      "Name,Location,false,false,Erasure,SizeTrash,false",
    );
  });

  it("keeps the slot of who shared inside a shared folder, as the old header's empty key", () => {
    const flags = {
      SharedByShareWithMe: false,
      AuthorShareWithMe: false,
      AccessLevelShareWithMe: true,
      ModifiedShareWithMe: true,
      SizeShareWithMe: false,
      TypeShareWithMe: false,
    };

    expect(filesColumnsRecord(SECTIONS.sharedWithMe, flags, options())).toBe(
      "Name,false,false,AccessLevelShareWithMe,ModifiedShareWithMe,false,false",
    );
    expect(filesColumnsRecord(SECTIONS.inSharedFolder, flags, options())).toBe(
      "Name,,false,AccessLevelShareWithMe,ModifiedShareWithMe,false,false",
    );
  });

  it("only knows the columns the section has", () => {
    expect(findSectionColumn(files, options(), "Erasure")).toBeUndefined();
    expect(
      findSectionColumn(
        files,
        options({ isPersonalReadOnly: true }),
        "Erasure",
      ),
    ).toBeDefined();
    expect(
      findSectionColumn(SECTIONS.recent, options(), "Author"),
    ).toBeUndefined();
  });
});
