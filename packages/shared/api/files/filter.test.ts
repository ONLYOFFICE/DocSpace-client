// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import FilesFilter from "./filter";

const conditions = [
  { fieldId: 1, op: "eq" as const, value: "ACME" },
  { fieldId: 2, op: "range" as const, from: "2026-01-01", to: "2026-06-30" },
  { fieldId: 3, op: "in" as const, optionIds: ["a", "b"] },
];

const toLocation = (search: string) =>
  ({ pathname: "/rooms/personal/filter", search: `?${search}` }) as Location;

const metadataFilter = () => {
  const filter = FilesFilter.getDefault();
  filter.metadataTemplateId = 5;
  filter.metadataFilters = conditions;
  return filter;
};

describe("FilesFilter metadata params", () => {
  it("survive the URL round trip", () => {
    const restored = FilesFilter.getFilter(
      toLocation(metadataFilter().toUrlParams()),
    );

    expect(restored.metadataTemplateId).toBe(5);
    expect(restored.metadataFilters).toEqual(conditions);
  });

  it("go to the API as an id and a JSON list", () => {
    const params = new URLSearchParams(metadataFilter().toApiUrlParams());

    expect(params.get("metadataTemplateId")).toBe("5");
    expect(JSON.parse(params.get("metadataFilters") ?? "")).toEqual(conditions);
  });

  it("are left out while empty", () => {
    const filter = FilesFilter.getDefault();
    filter.metadataFilters = [];

    expect(filter.toApiUrlParams()).not.toContain("metadata");
    expect(filter.toUrlParams()).not.toContain("metadata");
  });

  it("are copied by clone and compared by equals", () => {
    const filter = metadataFilter();
    const copy = filter.clone();

    expect(copy.equals(filter)).toBe(true);

    copy.metadataFilters = conditions.slice(1);

    expect(copy.equals(filter)).toBe(false);
  });
});
