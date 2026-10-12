// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";
import { createTestFilesActionsStore, t } from "./testHarness";

// Recursive {id,label} projection excluding onClick/handlers.
type Node = { id?: unknown; key?: unknown; label?: unknown; items?: Node[] };
const shape = (model: unknown[]): unknown[] =>
  (model as Node[]).map((m) => ({
    id: m?.id,
    label: m?.label,
    ...(Array.isArray(m?.items) ? { items: shape(m.items) } : {}),
  }));

// Maximally-enabling selection state so every option that a folder-type
// builder offers is actually produced (availability is gated by
// isAvailableOption, covered separately).
const enabling = {
  filesStore: {
    hasSelection: true,
    allFilesIsEditing: false,
    canConvertSelected: true,
    hasRoomsToChangeQuota: true,
    hasRoomsToDisableQuota: true,
    hasRoomsToResetQuota: true,
    hasAIAgentsToChangeQuota: true,
    hasAIAgentsToDisableQuota: true,
    hasAIAgentsToResetQuota: true,
    roomsFilter: { groupId: "g1", clone: () => ({}) },
    selection: [
      {
        id: 1,
        security: {
          Copy: true,
          Download: true,
          Move: true,
          Delete: true,
          CreateRoomFrom: true,
          Vectorization: true,
        },
      },
    ],
  },
  filesSettingsStore: { organizeRoomsGrouping: true },
  dialogsStore: { roomGroups: [{ id: "g1" }] },
};

const menuFor = (treeFlags: Record<string, boolean>) =>
  shape(
    createTestFilesActionsStore({
      ...enabling,
      treeFoldersStore: treeFlags,
    }).getHeaderMenu(t),
  );

describe("FilesActionsStore.getHeaderMenu — dispatch by folder type", () => {
  it("recycle bin", () => {
    expect(menuFor({ isRecycleBinFolder: true })).toMatchSnapshot();
  });
  it("favorites", () => {
    expect(menuFor({ isFavoritesFolder: true })).toMatchSnapshot();
  });
  it("privacy", () => {
    expect(menuFor({ isPrivacyFolder: true })).toMatchSnapshot();
  });
  it("shared with me", () => {
    expect(menuFor({ isSharedWithMeFolder: true })).toMatchSnapshot();
  });
  it("recent", () => {
    expect(menuFor({ isRecentFolder: true })).toMatchSnapshot();
  });
  it("archive rooms", () => {
    expect(menuFor({ isArchiveFolder: true })).toMatchSnapshot();
  });
  it("rooms", () => {
    expect(menuFor({ isRoomsFolder: true })).toMatchSnapshot();
  });
  it("templates", () => {
    expect(menuFor({ isTemplatesFolder: true })).toMatchSnapshot();
  });
  it("ai agents", () => {
    expect(menuFor({ isAIAgentsFolder: true })).toMatchSnapshot();
  });
  it("another (default) folder", () => {
    expect(menuFor({})).toMatchSnapshot();
  });
});
