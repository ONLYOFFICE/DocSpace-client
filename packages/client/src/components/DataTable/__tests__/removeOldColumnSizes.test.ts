import { afterEach, describe, expect, it } from "vitest";

import { removeOldColumnSizes } from "../removeOldColumnSizes";

describe("removeOldColumnSizes", () => {
  afterEach(() => localStorage.clear());

  it("drops the old table's widths and keeps everything else", () => {
    localStorage.setItem("filesColumnsSize_ver-4=user", "450px 337px 24px");
    localStorage.setItem("infoPanelPeopleColumnsSize_ver-3=user", "1px");
    localStorage.setItem("SDK_roomsColumnsSizeInfoPanel_ver-4=user", "1px");
    localStorage.setItem("webhooksConfigColumnsSize_ver-5=user", "1px");
    localStorage.setItem("filesTableColumns_ver-4=user", "Name,Size");
    localStorage.setItem("filesColumnsWidths_ver-1=user", '{"v":2}');
    localStorage.setItem("chatPanelWidth", "400");

    removeOldColumnSizes();

    const keys = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i),
    );
    expect(keys.sort()).toEqual([
      "chatPanelWidth",
      "filesColumnsWidths_ver-1=user",
      "filesTableColumns_ver-4=user",
    ]);
  });

  it("does nothing when the storage cannot be read", () => {
    const blocked = {
      get length(): number {
        throw new Error("blocked");
      },
    } as unknown as Storage;

    expect(() => removeOldColumnSizes(blocked)).not.toThrow();
  });
});
