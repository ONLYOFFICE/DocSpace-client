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

  it("drops the old settings tables' column lists and keeps their widths", () => {
    localStorage.setItem("webhooksConfigColumns_ver-5=user", "Name,URL");
    localStorage.setItem("nextcloudThirdColumns_ver-6=user", "Name,Email");
    localStorage.setItem("SessionsColumns_ver-5=user", "Platform");
    localStorage.setItem("auditTableColumns_ver-5=user", "User");
    localStorage.setItem("webhooksConfigColumnsWidths_ver-1=user", '{"v":2}');
    localStorage.setItem("peopleTableColumns_ver-3=user", "Name,Type");

    removeOldColumnSizes();

    const keys = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i),
    );
    expect(keys.sort()).toEqual([
      "peopleTableColumns_ver-3=user",
      "webhooksConfigColumnsWidths_ver-1=user",
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
