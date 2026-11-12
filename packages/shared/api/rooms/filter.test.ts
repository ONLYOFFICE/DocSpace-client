// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import { RoomSearchArea, RoomsType } from "../../enums";
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

describe("RoomsFilter AI Workspace default", () => {
  it("lists the AI projects when no room type is asked for", () => {
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AiHub);
    expect(filter.type).toEqual([String(RoomsType.AiProjectRoom)]);
    expect(filter.toUrlParams()).toContain(`type=${RoomsType.AiProjectRoom}`);

    const fromUrl = RoomsFilter.getFilter({ search: "?searchArea=AiHub" } as Location);
    expect(fromUrl?.type).toEqual([String(RoomsType.AiProjectRoom)]);
  });

  it("keeps the room type an address asks for", () => {
    const fromUrl = RoomsFilter.getFilter({
      search: `?searchArea=AiHub&type=${RoomsType.InstructionsRoom}`,
    } as Location);
    expect(fromUrl?.type).toEqual(String(RoomsType.InstructionsRoom));
  });

  it("leaves the other search areas without a type", () => {
    expect(RoomsFilter.getDefault(undefined, RoomSearchArea.Active).type).toBeNull();
  });
});

describe("RoomsFilter.hasTypeFilter", () => {
  it("never counts the AI Workspace list type as a filter", () => {
    const agents = RoomsFilter.getDefault(undefined, RoomSearchArea.AiHub);
    expect(agents.hasTypeFilter()).toBe(false);

    const skills = RoomsFilter.getFilter({
      search: `?searchArea=AiHub&type=${RoomsType.InstructionsRoom}`,
    } as Location);
    expect(skills?.hasTypeFilter()).toBe(false);
  });

  it("counts a room type as a filter in the other search areas", () => {
    const rooms = RoomsFilter.getDefault(undefined, RoomSearchArea.Active);
    expect(rooms.hasTypeFilter()).toBe(false);

    rooms.type = String(RoomsType.CustomRoom);
    expect(rooms.hasTypeFilter()).toBe(true);

    const archive = RoomsFilter.getDefault(undefined, RoomSearchArea.Archive);
    archive.type = [String(RoomsType.PublicRoom)];
    expect(archive.hasTypeFilter()).toBe(true);
  });
});
