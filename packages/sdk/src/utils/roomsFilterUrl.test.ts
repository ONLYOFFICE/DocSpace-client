import { describe, expect, it } from "vitest";

import RoomsFilter from "@docspace/shared/api/rooms/filter";

import { ROOMS_FILTER_URL_KEYS, roomsFilterQuery } from "./roomsFilterUrl";

const filterWith = (patch: Partial<RoomsFilter>) => {
  const filter = RoomsFilter.getDefault();
  Object.assign(filter, patch);
  return filter;
};

describe("roomsFilterQuery", () => {
  it("Frame reloaded after a filter change: the opt-in stays in the address", () => {
    const filter = filterWith({ sortOrder: "ascending" });
    const query = roomsFilterQuery(
      filter,
      "?privateRooms=true&sortOrder=descending&filterValue=old",
    );
    const params = new URLSearchParams(query);

    expect(params.get("privateRooms")).toBe("true");
    expect(params.get("sortOrder")).toBe(
      new URLSearchParams(filter.toUrlParams()).get("sortOrder"),
    );
    expect(params.getAll("sortOrder")).toHaveLength(1);
    expect(params.has("filterValue")).toBe(false);
  });

  it("drops every parameter the rooms filter owns that the new filter leaves out", () => {
    const query = roomsFilterQuery(
      RoomsFilter.getDefault(),
      "?tags=a&type=5&subjectId=x&privacyFilter=2&locale=en",
    );
    const params = new URLSearchParams(query);

    expect(params.has("tags")).toBe(false);
    expect(params.has("type")).toBe(false);
    expect(params.has("subjectId")).toBe(false);
    expect(params.has("privacyFilter")).toBe(false);
    expect(params.get("locale")).toBe("en");
  });

  it("leaves a generic list address without foreign parameters unchanged", () => {
    const filter = filterWith({ sortOrder: "ascending" });

    expect(roomsFilterQuery(filter, "")).toBe(filter.toUrlParams());
  });

  it("knows every parameter the rooms filter writes", () => {
    const filter = filterWith({
      filterValue: "q",
      provider: "box",
      type: 5,
      subjectId: "s",
      searchInContent: true,
      withSubfolders: true,
      searchArea: "Active",
      tags: ["t"],
      pageCount: 50,
      excludeSubject: true,
      withoutTags: true,
      subjectFilter: 1,
      quotaFilter: 1,
      storageFilter: 1,
      groupId: "g",
      subjectOwnerId: "o",
      privacyFilter: 2,
      metadataTemplateId: "m",
      metadataFilters: ["f"],
    } as unknown as Partial<RoomsFilter>);

    const written = [...new URLSearchParams(filter.toUrlParams()).keys()];

    expect(written.filter((key) => !ROOMS_FILTER_URL_KEYS.has(key))).toEqual(
      [],
    );
  });
});
