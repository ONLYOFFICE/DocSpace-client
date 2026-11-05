import { describe, it, expect, vi } from "vitest";

import type { TTranslation } from "@docspace/shared/types";

import { getApiKeysColumns } from "../apiKeysColumns";

const t = ((key: string) => key) as unknown as TTranslation;

describe("API keys columns", () => {
  it("are the old header's columns, then the row menu", () => {
    expect(
      getApiKeysColumns(t, "en", vi.fn()).map((column) => column.id),
    ).toEqual([
      "Name",
      "SecretKey",
      "Created",
      "LastUsed",
      "CreatedBy",
      "Permissions",
      "State",
      "ContextMenu",
    ]);
  });

  it("keep the old titles", () => {
    expect(
      getApiKeysColumns(t, "en", vi.fn())
        .slice(0, 7)
        .map((column) => column.title),
    ).toEqual([
      "Common:Label",
      "Webhooks:SecretKey",
      "Common:ByCreation",
      "Common:LastUsed",
      "Common:CreatedBy",
      "Common:Permissions",
      "Webhooks:State",
    ]);
  });

  it("have no wide column, as the old header's withoutWideColumn", () => {
    expect(
      getApiKeysColumns(t, "en", vi.fn())
        .slice(0, 7)
        .every((column) => column.width.type === "flex"),
    ).toBe(true);
  });
});
