import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getClientActiveId } from "../articleNavigation";

// The AI Workspace section's entries are the same /ai-rooms list narrowed to one
// room type through the `type` filter, so the sidebar highlights them by the
// query string, not by the path.
describe("AI Workspace section active item", () => {
  const ids = { roomsFolderId: 1 };

  it.each([
    ["/ai-rooms/filter", "", "ai-rooms"],
    ["/ai-rooms/filter", "?searchArea=AiHub", "ai-rooms"],
    // The agents have no entry: they are listed on the section's root.
    [
      "/ai-rooms/filter",
      `?searchArea=AiHub&type=${RoomsType.AiProjectRoom}`,
      "ai-rooms",
    ],
    [
      "/ai-rooms/filter",
      `?type=${RoomsType.InstructionsRoom}&searchArea=AiHub`,
      "ai-rooms-skills",
    ],
    ["/ai-rooms/filter", `?type=${RoomsType.KnowledgeRoom}`, "ai-rooms-knowledge"],
    // Two types picked in the filter bar is no entry of the sidebar.
    [
      "/ai-rooms/filter",
      `?type=${RoomsType.KnowledgeRoom}&type=${RoomsType.InstructionsRoom}`,
      "ai-rooms",
    ],
    ["/ai-rooms/123/filter", "?folder=123", "ai-rooms"],
    ["/ai-rooms/trash/filter", "?folder=5", "ai-rooms-trash"],
    // The former Recent / Favorites entries are gone: their routes still
    // resolve, but highlight the section itself.
    ["/ai-rooms/recent/filter", "?folder=7", "ai-rooms"],
    ["/ai-rooms/favorites/filter", "?folder=8", "ai-rooms"],
  ])("highlights %s%s as %s", (pathname, search, activeId) => {
    expect(getClientActiveId(pathname, ids, search)).toBe(activeId);
  });

  // An opened room's short address has no `type`: the room's own type tells
  // which entry lists it.
  it.each([
    [RoomsType.InstructionsRoom, "ai-rooms-skills"],
    [RoomsType.KnowledgeRoom, "ai-rooms-knowledge"],
    [RoomsType.AiProjectRoom, "ai-rooms"],
  ])("highlights an opened room of type %s as %s", (roomType, activeId) => {
    expect(
      getClientActiveId("/ai-rooms/32/filter", ids, "?folder=32", false, false, roomType),
    ).toBe(activeId);
  });

  it("takes the opened room's type over a type left in the query", () => {
    expect(
      getClientActiveId(
        "/ai-rooms/32/filter",
        ids,
        `?folder=32&type=${RoomsType.KnowledgeRoom}`,
        false,
        false,
        RoomsType.InstructionsRoom,
      ),
    ).toBe("ai-rooms-skills");
  });
});
