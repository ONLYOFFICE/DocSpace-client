import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getClientActiveId } from "../articleNavigation";

// The AI Chat section's entries are the same /ai-rooms list narrowed to one
// room type through the `type` filter, so the sidebar highlights them by the
// query string, not by the path.
describe("AI Chat section active item", () => {
  const ids = { roomsFolderId: 1 };

  it.each([
    ["/ai-rooms/filter", "", "ai-rooms"],
    ["/ai-rooms/filter", "?searchArea=AiHub", "ai-rooms"],
    [
      "/ai-rooms/filter",
      `?searchArea=AiHub&type=${RoomsType.AiProjectRoom}`,
      "ai-rooms-templates",
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
});
