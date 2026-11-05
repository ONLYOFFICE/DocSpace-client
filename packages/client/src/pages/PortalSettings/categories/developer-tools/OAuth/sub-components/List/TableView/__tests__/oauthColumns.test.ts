import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import { getOAuthColumns } from "../oauthColumns";

// What is under test is the columns, not the cells.
vi.mock("../columns/name", () => ({ default: () => null }));
vi.mock("../columns/creator", () => ({ default: () => null }));

const t = ((key: string) => key) as unknown as TFunction;

describe("OAuth columns", () => {
  it("are the old header's columns, then the row menu", () => {
    expect(getOAuthColumns(t, 0).map((column) => column.id)).toEqual([
      "Name",
      "Creator",
      "Modified",
      "Scopes",
      "State",
      "ContextMenu",
    ]);
  });

  it("keep the old titles", () => {
    expect(
      getOAuthColumns(t, 0)
        .slice(0, 5)
        .map((column) => column.title),
    ).toEqual([
      "Common:Label",
      "Creator",
      "Common:ByLastModified",
      "Scopes",
      "Webhooks:State",
    ]);
  });

  it("keep the old widths: a wide name, 150px minimums, a 64px switch", () => {
    expect(getOAuthColumns(t, 0).map((column) => column.width)).toEqual([
      { type: "fill" },
      { type: "flex", min: 150 },
      { type: "flex", min: 150 },
      { type: "flex", min: 150 },
      { type: "fixed", size: 64 },
      expect.objectContaining({ type: "fixed" }),
    ]);
  });

  it("measure the scopes column through its header", () => {
    const ref = () => {};
    const scopes = getOAuthColumns(t, 0, ref).find((c) => c.id === "Scopes");

    expect(scopes?.headerRef).toBe(ref);
  });
});
