import { describe, it, expect, beforeEach, vi } from "vitest";

import TableStore, { type TTableScope } from "../TableStore";

const contacts = vi.hoisted(() => ({
  view: false as false | "people" | "guests" | "groups" | "inside_group",
}));

vi.mock("SRC_DIR/helpers/contacts", () => ({
  getContactsView: () => contacts.view,
}));

type TSetup = {
  folder?: Partial<Record<string, boolean>>;
  contactsTab?: false | "people" | "guests" | "groups" | "inside_group";
  isIndexedFolder?: boolean;
  isFrame?: boolean;
  userId?: string;
};

const createStore = ({
  folder = {},
  contactsTab = false,
  isIndexedFolder = false,
  isFrame = false,
  userId = "user-1",
}: TSetup = {}) =>
  new TableStore(
    {} as never,
    { publicRoomStore: { isPublicRoom: false }, ...folder } as never,
    { user: userId ? { id: userId } : undefined } as never,
    { isFrame } as never,
    {} as never,
    { isIndexedFolder } as never,
    { usersStore: { contactsTab } } as never,
  );

const keysOf = (store: TableStore) => ({
  columns: store.tableStorageName,
  widths: store.columnWidthsStorageName,
});

const SECTIONS: { name: string; setup: TSetup; scope: TTableScope }[] = [
  { name: "My documents", setup: {}, scope: "files" },
  {
    name: "a templates list",
    setup: { folder: { isTemplatesFolder: true } },
    scope: "templates",
  },
  { name: "rooms", setup: { folder: { isRoomsFolder: true } }, scope: "rooms" },
  {
    name: "the archive",
    setup: { folder: { isArchiveFolder: true } },
    scope: "rooms",
  },
  {
    name: "the forms section",
    setup: { folder: { isFormsFolder: true } },
    scope: "rooms",
  },
  {
    name: "AI agents",
    setup: { folder: { isAiSectionFolder: true } },
    scope: "rooms",
  },
  { name: "people", setup: { contactsTab: "people" }, scope: "people" },
  { name: "guests", setup: { contactsTab: "guests" }, scope: "guests" },
  { name: "groups", setup: { contactsTab: "groups" }, scope: "groups" },
  {
    name: "a group",
    setup: { contactsTab: "inside_group" },
    scope: "insideGroup",
  },
  { name: "trash", setup: { folder: { isTrashFolder: true } }, scope: "trash" },
  {
    name: "recent",
    setup: { folder: { isRecentFolder: true } },
    scope: "recent",
  },
  {
    name: "favorites",
    setup: { folder: { isFavoritesFolder: true } },
    scope: "favorites",
  },
  {
    name: "shared with me",
    setup: { folder: { isSharedWithMeFolder: true } },
    scope: "sharedWithMe",
  },
  {
    name: "a shared folder",
    setup: { folder: { isInSharedFolder: true } },
    scope: "inSharedFolder",
  },
  {
    name: "a VDR folder",
    setup: { isIndexedFolder: true },
    scope: "vdrIndexing",
  },
];

describe("TableStore scope", () => {
  beforeEach(() => {
    contacts.view = false;
    localStorage.clear();
  });

  it.each(SECTIONS)("resolves $name to $scope", ({ setup, scope }) => {
    expect(createStore(setup).tableScope).toBe(scope);
  });

  it("keeps the keys the old table already stores under", () => {
    expect(SECTIONS.map(({ setup }) => keysOf(createStore(setup)))).toEqual([
      {
        columns: "filesTableColumns_ver-3=user-1",
        widths: "filesColumnsWidths_ver-1=user-1",
      },
      {
        columns: "templatesRoomsTableColumns_ver-3=user-1",
        widths: "templatesRoomsColumnsWidths_ver-1=user-1",
      },
      ...Array(4).fill({
        columns: "roomsTableColumns_ver-3=user-1",
        widths: "roomsColumnsWidths_ver-1=user-1",
      }),
      {
        columns: "peopleTableColumns_ver-3=user-1",
        widths: "peopleColumnsWidths_ver-1=user-1",
      },
      {
        columns: "guestsTableColumns_ver-1=user-1",
        widths: "guestsColumnsWidths_ver-1=user-1",
      },
      {
        columns: "groupsTableColumns_ver-6=user-1",
        widths: "groupsColumnsWidths_ver-1=user-1",
      },
      {
        columns: "insideGroupTableColumns_ver-6=user-1",
        widths: "insideGroupColumnsWidths_ver-1=user-1",
      },
      {
        columns: "trashTableColumns_ver-5=user-1",
        widths: "trashColumnsWidths_ver-1=user-1",
      },
      {
        columns: "recentTableColumns_ver-2=user-1",
        widths: "recentColumnsWidths_ver-1=user-1",
      },
      {
        columns: "favoritesTableColumns_ver-1=user-1",
        widths: "favoritesColumnsWidths_ver-1=user-1",
      },
      {
        columns: "sharedWithMeTableColumns_ver-2=user-1",
        widths: "sharedWithMeColumnsWidths_ver-1=user-1",
      },
      {
        columns: "inSharedFolderTableColumns_ver-1=user-1",
        widths: "inSharedFolderColumnsWidths_ver-1=user-1",
      },
      {
        columns: "vdrIndexingColumns_ver-3=user-1",
        widths: "vdrIndexingColumnsWidths_ver-1=user-1",
      },
    ]);
  });

  it("gives every section its own widths key", () => {
    const keys = SECTIONS.filter(
      ({ scope }, i, all) => all.findIndex((s) => s.scope === scope) === i,
    ).map(({ setup }) => createStore(setup).columnWidthsStorageName);

    expect(new Set(keys).size).toBe(13);
  });

  it("prefixes every key inside the SDK frame", () => {
    const keys = keysOf(createStore({ isFrame: true }));

    expect(Object.values(keys).every((key) => key.startsWith("SDK_"))).toBe(
      true,
    );
    expect(keys.widths).toBe("SDK_filesColumnsWidths_ver-1=user-1");
  });

  it("falls back to the guest id without a user", () => {
    expect(createStore({ userId: "" }).columnWidthsStorageName).toBe(
      "filesColumnsWidths_ver-1=guest",
    );
  });

  it("reads the contacts tab from the address when the store has none", () => {
    contacts.view = "groups";

    expect(createStore().tableScope).toBe("groups");
  });

  describe("keys that used to disagree", () => {
    it("takes columns and sizes from one section while a contacts tab is stale", () => {
      const store = createStore({
        folder: { isTrashFolder: true },
        contactsTab: "groups",
      });

      expect(keysOf(store)).toEqual({
        columns: "groupsTableColumns_ver-6=user-1",
        widths: "groupsColumnsWidths_ver-1=user-1",
      });
    });

    it("treats a shared folder with indexing as shared, like the Files header", () => {
      const store = createStore({
        folder: { isInSharedFolder: true },
        isIndexedFolder: true,
      });

      expect(store.tableScope).toBe("inSharedFolder");
      expect(store.columnWidthsStorageName).toBe(
        "inSharedFolderColumnsWidths_ver-1=user-1",
      );
    });
  });

  describe("visible columns", () => {
    it("applies the stored columns of the resolved section", () => {
      const store = createStore({
        folder: { isInSharedFolder: true },
        isIndexedFolder: true,
      });
      localStorage.setItem(
        store.tableStorageName,
        "Name,AuthorShareWithMe,SizeIndexing",
      );

      store.setColumnsEnable(null);

      expect(store.authorShareWithMeColumnIsEnabled).toBe(true);
      expect(store.sharedByShareWithMeColumnIsEnabled).toBe(false);
      expect(store.sizeVDRColumnIsEnabled).toBe(true);
    });

    it("sets the VDR columns and then the documents ones in a VDR folder", () => {
      const store = createStore({ isIndexedFolder: true });
      localStorage.setItem(store.tableStorageName, "Name,AuthorIndexing,Size");

      store.setColumnsEnable(null);

      expect(store.authorVDRColumnIsEnabled).toBe(true);
      expect(store.createdVDRColumnIsEnabled).toBe(false);
      expect(store.sizeColumnIsEnabled).toBe(true);
      expect(store.modifiedColumnIsEnabled).toBe(false);
    });

    it("falls back to the frame columns when nothing is stored", () => {
      const store = createStore({ folder: { isRoomsFolder: true } });

      store.setColumnsEnable("Name,Owner");

      expect(store.roomColumnOwnerIsEnabled).toBe(true);
      expect(store.roomColumnTagsIsEnabled).toBe(false);
    });

    it("toggles a shared column name by the resolved section", () => {
      const rooms = createStore({ folder: { isRoomsFolder: true } });
      const people = createStore({ contactsTab: "people" });
      const files = createStore();

      rooms.setColumnEnable("Type");
      people.setColumnEnable("Type");
      files.setColumnEnable("Type");

      expect(rooms.roomColumnTypeIsEnabled).toBe(true);
      expect(people.typePeopleColumnIsEnabled).toBe(false);
      expect(files.typeColumnIsEnabled).toBe(true);
    });
  });
});
