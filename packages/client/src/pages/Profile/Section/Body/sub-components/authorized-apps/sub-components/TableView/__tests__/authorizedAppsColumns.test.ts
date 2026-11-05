import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import { getAuthorizedAppsColumns } from "../authorizedAppsColumns";

// What is under test is the columns, not the name cell and its store.
vi.mock("../columns/name", () => ({ default: () => null }));

const t = ((key: string) => key) as unknown as TFunction;

describe("authorized apps columns", () => {
  it("are the old header's columns, then the row menu", () => {
    expect(
      getAuthorizedAppsColumns(t, "en").map((column) => [
        column.id,
        column.title,
      ]),
    ).toEqual([
      ["App", "OAuth:Apps"],
      ["Website", "Common:Website"],
      ["Access granted", "OAuth:AccessGranted"],
      ["ContextMenu", ""],
    ]);
  });

  it("keep the old minimum widths and sort by nothing", () => {
    const columns = getAuthorizedAppsColumns(t, "en");

    expect(columns.map((column) => column.width)).toEqual([
      { type: "fill" },
      { type: "flex", min: 150 },
      { type: "flex", min: 150 },
      { type: "fixed", size: 24 },
    ]);
    expect(columns.every((column) => !column.sortKey)).toBe(true);
    expect(columns.every((column) => !column.hideable)).toBe(true);
  });
});
