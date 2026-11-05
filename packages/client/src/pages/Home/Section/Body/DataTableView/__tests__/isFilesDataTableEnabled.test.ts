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

  it("draws the DataTable unless the switch is off", () => {
    expect(isFilesDataTableEnabled()).toBe(true);

    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "off");

    expect(isFilesDataTableEnabled()).toBe(false);
  });

  it("ignores any other value", () => {
    localStorage.setItem(FILES_DATA_TABLE_SWITCH, "false");

    expect(isFilesDataTableEnabled()).toBe(true);
  });

  it("draws the DataTable when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(isFilesDataTableEnabled()).toBe(true);
  });
});
