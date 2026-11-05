import { describe, it, expect, beforeEach } from "vitest";

import { dataTableSwitchKey, isDataTableEnabled } from "../isDataTableEnabled";

describe("isDataTableEnabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("switches each area on its own key", () => {
    localStorage.setItem(dataTableSwitchKey("contacts"), "off");

    expect(dataTableSwitchKey("contacts")).toBe("contacts-data-table");
    expect(isDataTableEnabled("contacts")).toBe(false);
    expect(isDataTableEnabled("files")).toBe(true);
    expect(isDataTableEnabled("settings")).toBe(true);
  });
});
