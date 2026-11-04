// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import RoomsFilter from "./filter";

const conditions = [
  { fieldId: 1, op: "eq" as const, value: "ACME" },
  { name: "Client", op: "eq" as const, value: "Contoso" },
];

const toLocation = (search: string) =>
  ({ pathname: "/rooms/shared/filter", search: `?${search}` }) as Location;

const metadataFilter = () => {
  const filter = RoomsFilter.getDefault();
  filter.metadataTemplateId = 7;
  filter.metadataFilters = conditions;
  return filter;
};

describe("RoomsFilter metadata params", () => {
  it("survive the URL round trip", () => {
    const restored = RoomsFilter.getFilter(
      toLocation(metadataFilter().toUrlParams()),
    );

    expect(restored?.metadataTemplateId).toBe(7);
    expect(restored?.metadataFilters).toEqual(conditions);
  });

  it("go to the API as an id and a JSON list", () => {
    const params = new URLSearchParams(metadataFilter().toApiUrlParams());

    expect(params.get("metadataTemplateId")).toBe("7");
    expect(JSON.parse(params.get("metadataFilters") ?? "")).toEqual(conditions);
  });

  it("are copied by clone and compared by equals", () => {
    const filter = metadataFilter();
    const copy = filter.clone();

    expect(copy.equals(filter)).toBe(true);

    copy.metadataTemplateId = null;

    expect(copy.equals(filter)).toBe(false);
  });
});
