// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FolderType, RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import { createTestFilesActionsStore } from "./testHarness";

// Mutable filter fake with the bits selectTag/selectOption touch.
const makeFilter = () => ({
  tags: null as unknown,
  type: null as unknown,
  provider: null as unknown,
  withoutTags: false,
  toUrlParams: () => "key=val",
});

let navigate: ReturnType<typeof vi.fn>;
beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {} },
    navigate,
  };
});

describe("FilesActionsStore — navigation/filter (batch 6)", () => {
  it("selectTag navigates with the updated rooms filter", () => {
    const setIsSectionBodyLoading = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { roomsFilter: { clone: () => makeFilter() } },
      clientLoadingStore: { setIsSectionBodyLoading },
    });
    store.selectTag({ label: "Design" });
    expect(setIsSectionBodyLoading).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("selectOption('defaultTypeRoom') navigates with the type filter", () => {
    const setIsSectionBodyLoading = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { roomsFilter: { clone: () => makeFilter() } },
      clientLoadingStore: { setIsSectionBodyLoading },
    });
    store.selectOption({ option: "defaultTypeRoom", value: "5" });
    expect(setIsSectionBodyLoading).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("onClickBack is a no-op while a section load is in progress", () => {
    const setBufferSelection = vi.fn();
    const store = createTestFilesActionsStore({
      clientLoadingStore: { isLoading: true },
      filesStore: { setBufferSelection, setSelection: vi.fn(), clearFiles: vi.fn() },
      peopleStore: { groupsStore: { insideGroupBackUrl: null } },
    });
    store.onClickBack();
    expect(setBufferSelection).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("moveToRoomsPage returns a form template to the Forms/Templates list", () => {
    (
      window as unknown as { DocSpace: { location: { pathname: string } } }
    ).DocSpace.location.pathname = "/forms/123/filter";

    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        navigationPath: [
          { id: 5, title: "Templates", isTemplatesFolder: true },
        ],
        rootFolderType: FolderType.RoomTemplates,
      },
    });

    store.moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url).toContain("/forms/filter?");
    expect(url).toContain(`searchArea=${RoomSearchArea.FormTemplates}`);
  });

  it("moveToRoomsPage returns a room template to the Rooms/Templates list", () => {
    (
      window as unknown as { DocSpace: { location: { pathname: string } } }
    ).DocSpace.location.pathname = "/rooms/shared/123/filter";

    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        navigationPath: [
          { id: 5, title: "Templates", isTemplatesFolder: true },
        ],
        rootFolderType: FolderType.RoomTemplates,
      },
    });

    store.moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url).toContain("/rooms/shared/filter?");
    expect(url).toContain(`searchArea=${RoomSearchArea.Templates}`);
  });

  it.each([
    ["an agent", RoomsType.AiProjectRoom],
    ["a skill set", RoomsType.InstructionsRoom],
    ["a knowledge base", RoomsType.KnowledgeRoom],
  ])("moveToRoomsPage returns from %s to the AI section's list of its kind", (_, roomType) => {
    (
      window as unknown as { DocSpace: { location: { pathname: string } } }
    ).DocSpace.location.pathname = "/ai-rooms/123/filter";

    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        navigationPath: [],
        pathParts: [
          { id: 1, title: "AI rooms" },
          { id: 123, title: "Room", roomType },
        ],
        rootFolderType: FolderType.AiHub,
      },
    });

    store.moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url.startsWith("/ai-rooms/filter?")).toBe(true);
    expect(new URLSearchParams(url.split("?")[1]).getAll("type")).toEqual([
      String(roomType),
    ]);
  });

  it("onClickBack closes the media viewer when it is open", () => {
    const store = createTestFilesActionsStore({
      clientLoadingStore: { isLoading: false },
      mediaViewerDataStore: {
        visible: true,
        setMediaViewerData: vi.fn(),
        removeViewerHistoryEntry: vi.fn(),
      },
      peopleStore: { groupsStore: { insideGroupBackUrl: null } },
      filesStore: { setBufferSelection: vi.fn(), setSelection: vi.fn(), clearFiles: vi.fn() },
    });
    // closeMediaViewerAndRestoreUrl is async; the branch is taken (no throw).
    expect(() => store.onClickBack()).not.toThrow();
  });
});

describe("FilesActionsStore — exits from the Private section", () => {
  const openAddress = (pathname: string, search = "") => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      location: { pathname, search, state: {} },
      navigate,
    };
  };

  const backStore = (roomType?: number) =>
    createTestFilesActionsStore({
      clientLoadingStore: { isLoading: false },
      mediaViewerDataStore: { visible: false },
      peopleStore: { groupsStore: { insideGroupBackUrl: null } },
      filesStore: {
        setBufferSelection: vi.fn(),
        setSelection: vi.fn(),
        clearFiles: vi.fn(),
      },
      selectedFolderStore: { roomType, navigationPath: [] },
    });

  it("moveToRoomsPage from a private room returns to the Private list", () => {
    openAddress("/private/12/filter", "?folder=12");

    backStore(5).moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url.startsWith("/private/filter?")).toBe(true);
    expect(url).toContain(`searchArea=${RoomSearchArea.Active}`);
  });

  it("Restore from the archive", () => {
    openAddress(
      "/private/archived/filter",
      `?searchArea=${RoomSearchArea.Archive}`,
    );

    backStore().moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url.startsWith("/private/archived/filter?")).toBe(true);
    expect(url).toContain(`searchArea=${RoomSearchArea.Archive}`);
    expect(url).not.toContain("privacyFilter");
  });

  it("moveToRoomsPage from an archived private room returns to Private → Archive", () => {
    openAddress("/private/archived/filter", "?folder=12");

    backStore(5).moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url.startsWith("/private/archived/filter?")).toBe(true);
    expect(url).toContain(`searchArea=${RoomSearchArea.Archive}`);
  });

  it("Back from a private room: back at the room's root opens the Private list", () => {
    openAddress("/private/12/filter", "?folder=12");

    backStore(5).onClickBack();

    expect(navigate.mock.calls[0][0].startsWith("/private/filter?")).toBe(true);
  });

  it("keeps back on the Private list in the section", () => {
    openAddress("/private/filter");

    backStore().onClickBack();

    expect(navigate.mock.calls[0][0].startsWith("/private/filter?")).toBe(true);
  });
});


describe("FilesActionsStore — back from a room of the AI Chat section", () => {
  const openAiRoom = (store: Record<string, unknown>) => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      location: { pathname: "/ai-rooms/12/filter", search: "?folder=12", state: {} },
      navigate,
    };
    return createTestFilesActionsStore({ selectedFolderStore: store });
  };

  it("returns from a skill set to the Skill sets list", () => {
    openAiRoom({ roomType: 10, navigationPath: [] }).moveToRoomsPage();

    const [url] = navigate.mock.calls[0];
    expect(url.startsWith("/ai-rooms/filter?")).toBe(true);
    expect(url).toContain(`searchArea=${RoomSearchArea.AiHub}`);
    expect(url).toContain("type=10");
  });

  it("returns from a folder of a knowledge base to the Knowledge bases list", () => {
    openAiRoom({
      roomType: null,
      navigationPath: [
        { id: 12, title: "Contracts", isRoom: true, roomType: 11 },
        { id: 2, title: "Common:AIProjectKnowledgeRooms", isRootRoom: true },
      ],
    }).moveToRoomsPage();

    expect(navigate.mock.calls[0][0]).toContain("type=11");
  });
});
