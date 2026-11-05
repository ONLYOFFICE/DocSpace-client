import { describe, it, expect } from "vitest";
import type { TFunction } from "i18next";

import { getMetadataTemplatesColumns } from "../metadataTemplatesColumns";

const t = ((key: string) => key) as unknown as TFunction;

describe("metadata templates columns", () => {
  it("are the old header's columns, then the row menu", () => {
    const columns = getMetadataTemplatesColumns(t, "en", () => {});

    expect(columns.map((column) => [column.id, column.title])).toEqual([
      ["Name", "Common:Name"],
      ["Fields", "Metadata:Fields"],
      ["Author", "Common:ByAuthor"],
      ["Modified", "Common:ByLastModified"],
      ["Visibility", "Metadata:Visibility"],
      ["ContextMenu", ""],
    ]);
  });

  it("let only the name fill, and sort by nothing", () => {
    const columns = getMetadataTemplatesColumns(t, "en", () => {});

    expect(columns[0].width).toEqual({ type: "fill" });
    expect(columns.slice(1, 5).map((column) => column.width.type)).toEqual([
      "flex",
      "flex",
      "flex",
      "flex",
    ]);
    expect(columns.some((column) => column.sortKey)).toBe(false);
  });
});
