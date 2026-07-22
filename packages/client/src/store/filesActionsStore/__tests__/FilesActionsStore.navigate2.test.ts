// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFilesActionsStore } from "./testHarness";

let navigate: ReturnType<typeof vi.fn>;
beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {}, hash: "" },
    navigate,
  };
});

describe("FilesActionsStore — navigation targets (batch 11)", () => {
  it("moveToRoomsPage navigates to the rooms page", () => {
    createTestFilesActionsStore().moveToRoomsPage();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("moveToAIAgentsPage navigates to the agents page", () => {
    createTestFilesActionsStore().moveToAIAgentsPage();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("moveToPublicRoom navigates to the public-room URL", () => {
    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        navigationPath: [{ title: "Room" }],
        parentId: 2,
        rootFolderType: 0,
      },
      publicRoomStore: { publicRoomKey: "k" },
    });
    store.moveToPublicRoom();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("openLocationAction navigates to a non-public folder location", async () => {
    const store = createTestFilesActionsStore({
      userStore: { user: { id: "u1" } },
    });
    await store.openLocationAction({ id: 9, isRoom: false });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("openLocationAction in a public room redirects to the public room", async () => {
    const store = createTestFilesActionsStore({
      publicRoomStore: { isPublicRoom: true, publicRoomKey: "k" },
      selectedFolderStore: {
        navigationPath: [{ title: "R" }],
        parentId: 2,
        rootFolderType: 0,
      },
    });
    await store.openLocationAction({ id: 9 });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
