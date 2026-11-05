import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import { getHistoryColumns } from "../historyColumns";

// What is under test is the columns, not the cells.
vi.mock("../../../../../sub-components/StatusBadge", () => ({
  default: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

describe("webhook history columns", () => {
  it("are the old header's columns, then the row menu", () => {
    expect(getHistoryColumns(t, "en").map((column) => column.id)).toEqual([
      "Event ID",
      "Status",
      "Trigger",
      "Delivery",
      "ContextMenu",
    ]);
  });

  it("keep the old titles", () => {
    expect(
      getHistoryColumns(t, "en")
        .slice(0, 4)
        .map((column) => column.title),
    ).toEqual(["EventID", "People:UserStatus", "EventType", "Delivery"]);
  });

  it("make the event id the wide column and sort by nothing", () => {
    const columns = getHistoryColumns(t, "en");

    expect(columns[0].width).toEqual({ type: "fill" });
    expect(columns.slice(1, 4).map((column) => column.width.type)).toEqual([
      "flex",
      "flex",
      "flex",
    ]);
    expect(columns.some((column) => column.sortKey)).toBe(false);
  });
});
