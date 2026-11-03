import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import {
  FILES_DATA_TABLE_SWITCH,
  isFilesDataTableEnabled,
} from "../isFilesDataTableEnabled";

describe("isFilesDataTableEnabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the old table until the switch is on", () => {
    expect(isFilesDataTableEnabled("files")).toBe(false);

    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "on");

    expect(isFilesDataTableEnabled("files")).toBe(true);
  });

  it("ignores any other value", () => {
    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "true");

    expect(isFilesDataTableEnabled("files")).toBe(false);
  });

  it("draws My documents, Trash, Recent and Favorites", () => {
    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "on");

    for (const scope of ["files", "trash", "recent", "favorites"] as const) {
      expect(isFilesDataTableEnabled(scope)).toBe(true);
    }
  });

  it("leaves the sections it cannot draw yet on the old table", () => {
    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "on");

    expect(isFilesDataTableEnabled("sharedWithMe")).toBe(false);
    expect(isFilesDataTableEnabled("vdrIndexing")).toBe(false);
    expect(isFilesDataTableEnabled("rooms")).toBe(false);
    expect(isFilesDataTableEnabled("people")).toBe(false);
  });

  it("falls back to the old table when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(isFilesDataTableEnabled("files")).toBe(false);
  });
});
