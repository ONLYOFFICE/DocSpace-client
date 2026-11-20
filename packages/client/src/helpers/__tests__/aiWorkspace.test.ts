import { describe, expect, it } from "vitest";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";

import {
  getAgentCategories,
  getAiEmptyFilterDescription,
  getAiListEmptyTexts,
  getAgentCategory,
  getAgentCategoryUrl,
  getVisibleAgentsFilter,
  isAgentListNarrowed,
  getAiListTitle,
  getAiRoomListType,
  getAiWorkspaceCreateLabel,
  getAiWorkspaceCreatePayload,
  getAiWorkspaceInfoPanelHint,
  getAiWorkspaceListType,
  getAiWorkspaceTabUrl,
  getAiWorkspaceListUrlOf,
  hasAiWorkspaceTemplates,
  getAiWorkspaceTitle,
  isAiWorkspaceCreateRefused,
  isAiWorkspaceTemplates,
  isAgent,
} from "../aiWorkspace";

const t = (key: string) => key;

describe("AI Chat section lists", () => {
  it.each([
    ["", RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [`?type=${RoomsType.AiProjectRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [
      `?searchArea=AiHub&type=${RoomsType.InstructionsRoom}`,
      RoomsType.InstructionsRoom,
      "Common:SkillSets",
      { startRoomType: RoomsType.InstructionsRoom },
    ],
    [
      `?type=${RoomsType.KnowledgeRoom}&page=1`,
      RoomsType.KnowledgeRoom,
      "Common:AIProjectKnowledgeRooms",
      { startRoomType: RoomsType.KnowledgeRoom },
    ],
    // Several types, or one from another section, are the agents' list.
    [`?type=${RoomsType.KnowledgeRoom}&type=${RoomsType.InstructionsRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [`?type=${RoomsType.CustomRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
  ])("%s lists %s", (search, type, title, payload) => {
    expect(getAiWorkspaceListType(search)).toBe(type);
    expect(getAiWorkspaceTitle(t, search)).toBe(title);
    expect(getAiWorkspaceCreatePayload(search)).toEqual(payload);
  });

  it.each([
    ["", "Common:NewAgent"],
    [`?type=${RoomsType.AiProjectRoom}`, "Common:NewAgent"],
    [`?type=${RoomsType.InstructionsRoom}`, "Common:New"],
    [`?type=${RoomsType.KnowledgeRoom}`, "Common:New"],
  ])("labels the create button of %s %s, not New room", (search, label) => {
    expect(getAiWorkspaceCreateLabel(t, search)).toBe(label);
  });
});

describe("AI Chat section lists in the Info panel", () => {
  it.each([
    ["", "Common:AIAgentsEmptyScreenTent"],
    [`?type=${RoomsType.AiProjectRoom}&tab=templates`, "Common:AIAgentsEmptyScreenTent"],
    [`?type=${RoomsType.InstructionsRoom}`, "InfoPanel:SkillSetsEmptyScreenText"],
    [`?type=${RoomsType.KnowledgeRoom}`, "InfoPanel:KnowledgeBasesEmptyScreenText"],
  ])("%s with nothing selected says %s", (search, hint) => {
    expect(getAiWorkspaceInfoPanelHint(t, search)).toBe(hint);
  });
});

describe("The list of a room of the AI Chat section", () => {
  it.each([
    [RoomsType.InstructionsRoom, "Common:SkillSets"],
    [RoomsType.KnowledgeRoom, "Common:AIProjectKnowledgeRooms"],
    [RoomsType.AiProjectRoom, "Common:Agents"],
  ])("a room of type %s is in %s", (type, title) => {
    expect(getAiRoomListType(type)).toBe(type);
    expect(getAiListTitle(t, type)).toBe(title);
  });

  it("knows no list for another room", () => {
    expect(getAiRoomListType(RoomsType.CustomRoom)).toBeNull();
    expect(getAiRoomListType(undefined)).toBeNull();
    expect(getAiRoomListType(null)).toBeNull();
  });
});

describe("AI Chat section list tabs", () => {
  const search = (url: string) => `?${url.split("?")[1]}`;

  it("keeps both tabs of the agents on that list of the section", () => {
    for (const isTemplates of [false, true]) {
      const url = getAiWorkspaceTabUrl(isTemplates, RoomsType.AiProjectRoom);
      expect(url).toMatch(/^\/ai-rooms\/filter\?/);
      expect(new URLSearchParams(search(url)).get("searchArea")).toBe("AiHub");
      expect(getAiWorkspaceListType(search(url))).toBe(RoomsType.AiProjectRoom);
      expect(hasAiWorkspaceTemplates(search(url))).toBe(true);
      expect(isAiWorkspaceTemplates(search(url))).toBe(isTemplates);
    }
  });

  it.each([RoomsType.InstructionsRoom, RoomsType.KnowledgeRoom])(
    "gives the list of type %s no Templates tab",
    (type) => {
      const url = getAiWorkspaceTabUrl(true, type);
      expect(new URLSearchParams(search(url)).has("tab")).toBe(false);
      expect(getAiWorkspaceListType(search(url))).toBe(type);
      expect(hasAiWorkspaceTemplates(search(url))).toBe(false);
      // A stale address with the tab still shows the list.
      expect(isAiWorkspaceTemplates(`${search(url)}&tab=templates`)).toBe(false);
    },
  );
});

describe("getAiWorkspaceListUrlOf", () => {
  const typeOf = (url: string) =>
    new URLSearchParams(url.split("?")[1]).getAll("type");

  it.each([
    [RoomsType.AiProjectRoom, RoomsType.AiProjectRoom],
    [RoomsType.InstructionsRoom, RoomsType.InstructionsRoom],
    [RoomsType.KnowledgeRoom, RoomsType.KnowledgeRoom],
    [undefined, RoomsType.AiProjectRoom],
    [null, RoomsType.AiProjectRoom],
    [RoomsType.AIRoom, RoomsType.AiProjectRoom],
  ])("narrows the section's list of a room of type %s to type %s", (roomType, listType) => {
    const url = getAiWorkspaceListUrlOf(roomType, "user-1");
    expect(url).toMatch(/^\/ai-rooms\/filter\?/);
    expect(typeOf(url)).toEqual([String(listType)]);
    expect(isAiWorkspaceTemplates(`?${url.split("?")[1]}`)).toBe(false);
  });
});

describe("isAgent", () => {
  it.each([
    ["a project read through the projects API", { id: 1, isAIProject: true }, true],
    ["an agent room of the Files list", { id: 1, isRoom: true, roomType: RoomsType.AiProjectRoom }, true],
    ["a skill set", { id: 1, isRoom: true, roomType: RoomsType.InstructionsRoom }, false],
    ["a knowledge base", { id: 1, isRoom: true, roomType: RoomsType.KnowledgeRoom }, false],
    ["a custom room", { id: 1, isRoom: true, roomType: RoomsType.CustomRoom }, false],
    ["a file", { id: 1, fileExst: ".docx" }, false],
    ["nothing", null, false],
  ])("tells %s", (_, item, expected) => {
    expect(isAgent(item)).toBe(expected);
  });
});

describe("isAiWorkspaceCreateRefused", () => {
  it.each([
    [RoomsType.KnowledgeRoom, false, true],
    [RoomsType.KnowledgeRoom, true, false],
    [RoomsType.InstructionsRoom, false, false],
    [RoomsType.AiProjectRoom, false, false],
  ])("the list of type %s with vectorization on: %s refuses New room: %s", (type, vectorizationEnabled, refused) => {
    expect(isAiWorkspaceCreateRefused(`?type=${type}`, vectorizationEnabled)).toBe(refused);
  });
});

describe("Agents list categories", () => {
  const agent = (tags: string[]) => ({ isRoom: true, roomType: RoomsType.AiProjectRoom, tags });
  const agentsFilter = () => {
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AiHub);
    filter.searchArea = RoomSearchArea.AiHub;
    return filter;
  };
  const params = (url: string) => new URLSearchParams(url.split("?")[1]);

  it("reads the agents' tags, each once, in the order they appear", () => {
    expect(
      getAgentCategories([
        agent(["Legal", "Reports"]),
        agent([]),
        agent(["HR docs", "Legal"]),
        { roomType: RoomsType.InstructionsRoom, tags: ["Skills"] },
      ]),
    ).toEqual(["Legal", "Reports", "HR docs"]);
  });

  it("has no categories when no agent carries a tag", () => {
    expect(getAgentCategories([agent([]), agent([])])).toEqual([]);
  });

  it("maps a category onto the tag of the rooms filter, kept in the address", () => {
    const filter = agentsFilter();
    filter.filterValue = "review";
    filter.page = 3;

    const url = getAgentCategoryUrl(filter, "Legal");
    expect(url).toMatch(/^\/ai-rooms\/filter\?/);
    const query = params(url);
    expect(JSON.parse(query.get("tags") ?? "null")).toEqual(["Legal"]);
    // The search stays; the list starts again from its first page.
    expect(query.get("filterValue")).toBe("review");
    expect(query.get("page")).toBe("1");
    expect(getAiWorkspaceListType(`?${query}`)).toBe(RoomsType.AiProjectRoom);

    // Read back from the address, the filter names the same category.
    const read = RoomsFilter.getFilter({ search: `?${query}` } as Location);
    expect(read && getAgentCategory(read)).toBe("Legal");
  });

  it("maps All onto no tag", () => {
    const filter = agentsFilter();
    filter.tags = ["Legal"];

    const query = params(getAgentCategoryUrl(filter, null));
    expect(query.has("tags")).toBe(false);
    const read = RoomsFilter.getFilter({ search: `?${query}` } as Location);
    expect(read).not.toBeNull();
    expect(read && getAgentCategory(read)).toBe(null);
  });

  it.each([
    [{ tags: null, withoutTags: false }, null],
    [{ tags: ["Legal"], withoutTags: false }, "Legal"],
    [{ tags: "Legal", withoutTags: false }, "Legal"],
    [{ tags: ["Legal", "HR docs"], withoutTags: false }, undefined],
    [{ tags: null, withoutTags: "true" }, undefined],
  ])("reads the category of the filter %o as %s", (filter, category) => {
    expect(getAgentCategory(filter as never)).toBe(category);
  });

  it("tells a list narrowed beyond its room type", () => {
    const filter = agentsFilter();
    expect(isAgentListNarrowed(filter)).toBe(false);

    filter.tags = ["Legal"];
    expect(isAgentListNarrowed(filter)).toBe(true);

    filter.tags = null;
    filter.filterValue = "review";
    expect(isAgentListNarrowed(filter)).toBe(true);
  });

  it("reads every agent the user can see without a tag or a search", () => {
    const filter = getVisibleAgentsFilter();
    expect(filter.searchArea).toBe(RoomSearchArea.AiHub);
    expect(filter.type).toEqual([String(RoomsType.AiProjectRoom)]);
    expect(filter.pageCount).toBe(100);
    expect(isAgentListNarrowed(filter)).toBe(false);
  });
});


describe("empty lists of the AI Chat section", () => {
  it.each([
    [RoomsType.AiProjectRoom, "Agents"],
    [RoomsType.InstructionsRoom, "SkillSets"],
    [RoomsType.KnowledgeRoom, "KnowledgeBases"],
  ])("list %s names only what it holds", (type, prefix) => {
    expect(getAiListEmptyTexts(t, type)).toEqual({
      title: `EmptyView:${prefix}EmptyTitle`,
      description: `EmptyView:${prefix}EmptyDescription`,
      userTitle: `EmptyView:${prefix}EmptyUserTitle`,
      userDescription: `EmptyView:${prefix}EmptyUserDescription`,
      createDescription: `EmptyView:${prefix}CreateDescription`,
    });
  });

  it.each([
    [RoomsType.AiProjectRoom, "Common:EmptyFilterAIAgentsDescription"],
    [RoomsType.InstructionsRoom, "Common:EmptyFilterSkillSetsDescription"],
    [RoomsType.KnowledgeRoom, "Common:EmptyFilterKnowledgeBasesDescription"],
  ])("a search of list %s that found nothing names the list", (type, key) => {
    expect(
      getAiEmptyFilterDescription(t, { isAiHubFolder: true, listType: type }),
    ).toBe(key);
  });

  it("a search inside a skill set or a knowledge base names what it holds", () => {
    const inside = (roomType: RoomsType | null) =>
      getAiEmptyFilterDescription(t, {
        isAiHubFolder: false,
        listType: RoomsType.AiProjectRoom,
        roomType,
      });
    expect(inside(RoomsType.InstructionsRoom)).toBe(
      "Common:EmptyFilterSkillsDescription",
    );
    expect(inside(RoomsType.KnowledgeRoom)).toBe(
      "Common:EmptyFilterKnowledgeFilesDescription",
    );
    // Any other room keeps the wording of the files and rooms lists.
    expect(inside(RoomsType.CustomRoom)).toBeNull();
    expect(inside(null)).toBeNull();
  });
});
