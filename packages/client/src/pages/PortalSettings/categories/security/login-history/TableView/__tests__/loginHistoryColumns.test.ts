import { describe, it, expect } from "vitest";
import type { TFunction } from "i18next";

import { getLoginHistoryColumns } from "../loginHistoryColumns";

const t = ((key: string) => key) as unknown as TFunction;

describe("login history columns", () => {
  it("are the old header's columns, the user filling the rest", () => {
    const columns = getLoginHistoryColumns(t, "en");

    expect(
      columns.map((column) => [column.id, column.title, column.width.type]),
    ).toEqual([
      ["User", "Common:User", "fill"],
      ["Date", "Common:Date", "flex"],
      ["Action", "Common:Action", "flex"],
    ]);
    expect(columns.some((column) => column.sortKey)).toBe(false);
  });
});
