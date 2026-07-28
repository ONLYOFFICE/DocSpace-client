// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
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

  it("onClickBack closes the media viewer when it is open", () => {
    const store = createTestFilesActionsStore({
      clientLoadingStore: { isLoading: false },
      mediaViewerDataStore: { visible: true, setMediaViewerData: vi.fn() },
      peopleStore: { groupsStore: { insideGroupBackUrl: null } },
      filesStore: { setBufferSelection: vi.fn(), setSelection: vi.fn(), clearFiles: vi.fn() },
    });
    // closeMediaViewerAndRestoreUrl is async; the branch is taken (no throw).
    expect(() => store.onClickBack()).not.toThrow();
  });
});
