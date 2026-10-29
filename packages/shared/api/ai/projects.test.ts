// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn(async (_options: unknown): Promise<unknown> => ({}));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

import {
  AiProjectAccess,
  AI_PROJECT_ROOM_TYPE,
  aiProjectToRoom,
  createAiProject,
  duplicateAiProject,
  getAiProjectKnowledge,
  getAiProjects,
  getAiProjectSkills,
  isAiProjectRoom,
  pinAiProject,
  toAiProject,
  updateAiProject,
} from "./projects";

type TFolder = Parameters<typeof toAiProject>[0];

const folder = (overrides: Record<string, unknown> = {}): TFolder => ({
  id: 7,
  title: "Sales",
  created: "2026-10-01T00:00:00.000Z",
  access: AiProjectAccess.Member,
  inRoom: true,
  logo: { color: "FF6680", original: "" },
  security: { Read: true, EditRoom: false, Pin: true },
  aiProject: {
    profile: { id: "p1", name: "Claude", provider: "anthropic", available: true },
    instructionsRooms: [{ id: 12, title: null, logo: { color: "123456" } }],
    knowledgeRooms: [{ id: 9, title: "Docs", available: false, archived: true }],
    canEditSettings: false,
  },
  ...overrides,
}) as unknown as TFolder;

describe("toAiProject", () => {
  it("reads the room as a project, with its colours prefixed and Leave derived", () => {
    const project = toAiProject(folder());
    expect(project.logo.color).toBe("#FF6680");
    expect(project.roomType).toBe(AI_PROJECT_ROOM_TYPE);
    expect(project.security).toMatchObject({ Read: true, Pin: true, EditRoom: false, Delete: false });
    expect(project.security.Leave).toBe(true);
    expect(project.aiProject.instructionsRooms[0]).toEqual({
      id: 12,
      title: "",
      available: true,
      archived: false,
      logo: { color: "#123456" },
    });
    expect(project.aiProject.knowledgeRooms[0]).toMatchObject({ available: false, archived: true });
    expect(project.aiProject.canEditSettings).toBe(false);
    expect(project.aiProject.warnings).toBeUndefined();
  });

  it("keeps a colour that already carries the hash", () => {
    expect(toAiProject(folder({ logo: { color: "#ABCDEF" } })).logo.color).toBe("#ABCDEF");
  });

  it("gives the owner no Leave and the edit right over the settings", () => {
    const project = toAiProject(
      folder({ access: AiProjectAccess.Owner, security: { EditRoom: true }, aiProject: null }),
    );
    expect(project.security.Leave).toBe(false);
    expect(project.aiProject).toEqual({
      profile: null,
      instructionsRooms: [],
      knowledgeRooms: [],
      canEditSettings: true,
    });
  });

  it("carries the server's warnings only when there are some", () => {
    const warnings = [{ code: "grantSkipped" as const, message: "Viewer skipped" }];
    expect(
      toAiProject(folder({ aiProject: { warnings } })).aiProject.warnings,
    ).toEqual(warnings);
    expect(toAiProject(folder({ aiProject: { warnings: [] } })).aiProject.warnings).toBeUndefined();
  });
});

describe("aiProjectToRoom", () => {
  it("shapes the project as the room panels read it", () => {
    const room = aiProjectToRoom(toAiProject(folder({ security: { EditAccess: true } })));
    expect(room.logo.color).toBe("FF6680");
    expect(room).toMatchObject({
      isRoom: true,
      isAIProject: true,
      canShare: true,
      tags: [],
      fileEntryType: 1,
    });
    expect(isAiProjectRoom(room)).toBe(true);
    expect(isAiProjectRoom({ roomType: 10 })).toBe(false);
    expect(isAiProjectRoom(null)).toBe(false);
  });
});

describe("the calls", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("lists with only the set query fields, from a plain page or an envelope", async () => {
    request.mockResolvedValueOnce({ total: 1, folders: [folder()] });
    const page = await getAiProjects({
      filterValue: "sa",
      sortBy: "AZ",
      subjectId: undefined,
      instructionsRoomId: 12,
      startIndex: 0,
      count: 100,
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/ai/projects?filterValue=sa&sortBy=AZ&instructionsRoomId=12&startIndex=0&count=100",
      }),
    );
    expect(page.total).toBe(1);
    expect(page.folders[0].logo.color).toBe("#FF6680");

    request.mockResolvedValueOnce({ items: { total: 0, folders: [] } });
    expect((await getAiProjects()).folders).toEqual([]);
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ url: "/ai/projects" }));
  });

  it("sends a create and an update as room fields, the colour without its hash", async () => {
    request.mockResolvedValue(folder());
    await createAiProject({
      title: "Sales",
      logo: { color: "#FF6680" },
      aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [] },
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      url: "/ai/projects",
      data: {
        title: "Sales",
        color: "FF6680",
        aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [] },
      },
    });

    await updateAiProject(7, { logo: { cover: "cover-1" } });
    expect(request).toHaveBeenLastCalledWith({
      method: "PUT",
      url: "/ai/projects/7",
      data: { cover: "cover-1" },
    });
  });

  it("pins and unpins by path", async () => {
    request.mockResolvedValue(folder());
    await pinAiProject(7, true);
    expect(request).toHaveBeenLastCalledWith({ method: "PUT", url: "/ai/projects/7/pin" });
    await pinAiProject(7, false);
    expect(request).toHaveBeenLastCalledWith({ method: "PUT", url: "/ai/projects/7/unpin" });
  });

  it("takes the first operation of a duplicate, however the server wraps it", async () => {
    request.mockResolvedValueOnce([{ id: "op1" }]);
    expect(await duplicateAiProject(7)).toEqual({ id: "op1" });
    request.mockResolvedValueOnce({ id: "op2" });
    expect(await duplicateAiProject(7)).toEqual({ id: "op2" });
  });

  it("prefixes the linked rooms' colours in the skills and knowledge lists", async () => {
    request.mockResolvedValueOnce({ rooms: [{ id: 12, logo: { color: "AABBCC" } }, { id: 13, logo: null }] });
    const skills = await getAiProjectSkills(7);
    expect(request).toHaveBeenLastCalledWith({ method: "GET", url: "/ai/projects/7/skills" });
    expect(skills.map((room) => room.logo?.color ?? null)).toEqual(["#AABBCC", null]);

    request.mockResolvedValueOnce({ rooms: [{ id: 9, logo: { color: "#DDEEFF" } }] });
    const knowledge = await getAiProjectKnowledge(7);
    expect(request).toHaveBeenLastCalledWith({ method: "GET", url: "/ai/projects/7/knowledge" });
    expect(knowledge[0].logo?.color).toBe("#DDEEFF");
  });
});
