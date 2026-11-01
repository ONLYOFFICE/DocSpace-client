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
  getAiProjectKnowledge,
  getAiProjects,
  getAiProject,
  getAiProjectSkills,
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
    expect(project.tags).toEqual([]);
    expect(project.updatedBy).toEqual(project.createdBy);
  });

  it("carries the room tags", () => {
    expect(toAiProject(folder({ tags: ["sales", "legal"] })).tags).toEqual(["sales", "legal"]);
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
      partial: true,
      profile: null,
      instructionsRooms: [],
      knowledgeRooms: [],
      canEditSettings: true,
    });
  });

  it("carries the server's warnings only when there are some", () => {
    const warnings = [{ code: "roomUnavailable" as const, message: "Room refused" }];
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
  });
});

describe("the calls", () => {
  beforeEach(() => {
    request.mockReset();
  });

  const sources = (instructions: number[] = [], knowledge: number[] = []) => ({
    instructionsRooms: instructions.map((id) => ({ id, title: `I${id}`, logo: { color: "123456" } })),
    knowledgeRooms: knowledge.map((id) => ({ id, title: `K${id}`, logo: null })),
  });

  // Answers by method and URL, so the order of parallel calls does not matter.
  const route = (table: Record<string, unknown | ((options: { data?: unknown }) => unknown)>) =>
    request.mockImplementation(async (options) => {
      const { method, url } = options as { method: string; url: string };
      const answer = table[`${method} ${url}`];
      if (answer === undefined) throw new Error(`unexpected ${method} ${url}`);
      return typeof answer === "function" ? answer(options as { data?: unknown }) : answer;
    });

  it("lists the AI projects of the AI rooms root, with only the set query fields", async () => {
    request.mockResolvedValueOnce({ total: 1, folders: [folder()] });
    const page = await getAiProjects({
      filterValue: "sa",
      sortBy: "Tags",
      subjectId: undefined,
      subjectOwnerId: "u1",
      tags: ["sales", "legal"],
      startIndex: 0,
      count: 100,
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/files/rooms?filterValue=sa&sortBy=Tags&subjectOwnerId=u1&tags=%5B%22sales%22%2C%22legal%22%5D&startIndex=0&count=100&searchArea=AiHub&type=12",
      }),
    );
    expect(page.total).toBe(1);
    expect(page.folders[0].logo.color).toBe("#FF6680");

    request.mockResolvedValueOnce({ items: { total: 0, folders: [] } });
    expect((await getAiProjects()).folders).toEqual([]);
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: "/files/rooms?searchArea=AiHub&type=12" }),
    );
  });

  it("reads a project as its room with the sources as the aiProject block", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined, security: { EditRoom: true } }),
      "GET /files/rooms/7/sources": sources([12], [9]),
    });
    const project = await getAiProject(7);
    expect(project.aiProject.partial).toBeUndefined();
    expect(project.aiProject.profile).toBeNull();
    expect(project.aiProject.canEditSettings).toBe(true);
    expect(project.aiProject.instructionsRooms).toEqual([
      { id: 12, title: "I12", roomType: 10, available: true, archived: false, logo: { color: "#123456" } },
    ]);
    expect(project.aiProject.knowledgeRooms[0]).toMatchObject({ id: 9, roomType: 11, logo: undefined });
  });

  it("creates the room as type 12 without the model, then links its sources", async () => {
    route({
      "POST /files/rooms": folder({ aiProject: undefined }),
      "POST /files/rooms/7/sources": {},
      "GET /files/rooms/7/sources": sources([12]),
    });
    const project = await createAiProject({
      title: "Sales",
      tags: ["sales"],
      logo: { color: "#FF6680" },
      aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [] },
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      url: "/files/rooms",
      data: { title: "Sales", tags: ["sales"], color: "FF6680", roomType: 12 },
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      url: "/files/rooms/7/sources",
      data: { roomIds: [12] },
    });
    expect(project.aiProject.instructionsRooms.map((room) => room.id)).toEqual([12]);
  });

  it("creates a project without sources in one call", async () => {
    route({ "POST /files/rooms": folder({ aiProject: undefined }) });
    const project = await createAiProject({ title: "Sales" });
    expect(request).toHaveBeenCalledTimes(1);
    expect(project.aiProject.instructionsRooms).toEqual([]);
  });

  it("updates the room fields and brings the sources to the lists sent", async () => {
    let linked = sources([12, 13], [9]);
    route({
      "PUT /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": () => linked,
      "DELETE /files/rooms/7/sources": () => {
        linked = sources([12], []);
        return {};
      },
      "POST /files/rooms/7/sources": () => {
        linked = sources([12, 14], []);
        return {};
      },
    });
    const project = await updateAiProject(7, {
      logo: { cover: "cover-1" },
      aiProject: { instructionsRoomIds: [12, 14], knowledgeRoomIds: [] },
    });
    expect(request).toHaveBeenCalledWith({ method: "PUT", url: "/files/rooms/7", data: { cover: "cover-1" } });
    expect(request).toHaveBeenCalledWith({
      method: "DELETE",
      url: "/files/rooms/7/sources",
      data: { roomIds: [13, 9] },
    });
    expect(request).toHaveBeenCalledWith({
      method: "POST",
      url: "/files/rooms/7/sources",
      data: { roomIds: [14] },
    });
    expect(project.aiProject.instructionsRooms.map((room) => room.id)).toEqual([12, 14]);
  });

  it("reads the room instead of writing it when only the sources change, and keeps a list not sent", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources([12], [9]),
    });
    await updateAiProject(7, { aiProject: { instructionsRoomIds: [12] } });
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "PUT" }));
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "DELETE" }));
  });

  it("turns a refused link into a warning and keeps the save", async () => {
    route({
      "PUT /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "POST /files/rooms/7/sources": () => {
        throw { response: { data: { error: { message: "Room 14 is not yours" } } } };
      },
    });
    const project = await updateAiProject(7, { title: "Sales", aiProject: { instructionsRoomIds: [14] } });
    expect(project.aiProject.warnings).toEqual([
      { code: "roomUnavailable", roomId: 14, subjectId: null, message: "Room 14 is not yours" },
    ]);
  });

  it("saves an edit from the opened project without reading the sources or rewriting the model", async () => {
    route({ "PUT /files/rooms/7": folder({ aiProject: undefined }) });
    const opened = toAiProject(
      folder({
        aiProject: {
          profile: { id: "p1", name: "Claude", provider: "anthropic", available: true },
          instructionsRooms: [{ id: 12, title: "Skills" }, { id: 13, title: "Old" }],
          knowledgeRooms: [{ id: 9, title: "Docs" }],
        },
      }),
    );
    request.mockClear();
    const project = await updateAiProject(
      7,
      { title: "Sales", aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [9] } },
      opened,
    );
    expect(request.mock.calls.map(([config]) => `${(config as { method: string }).method} ${(config as { url: string }).url}`)).toEqual([
      "PUT /files/rooms/7",
      "DELETE /files/rooms/7/sources",
    ]);
    expect(project.aiProject.instructionsRooms.map((room) => room.id)).toEqual([12]);
    expect(project.aiProject.knowledgeRooms.map((room) => room.title)).toEqual(["Docs"]);
    expect(project.aiProject.profile?.id).toBe("p1");
  });

  const PROFILE = { id: "p1", name: "Claude", provider: "anthropic", available: true };

  it("reads the project's model with the room, and the default when it cannot be read", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "GET /ai/projects/7/model": { profile: PROFILE },
    });
    expect((await getAiProject(7)).aiProject.profile).toEqual(PROFILE);

    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
    });
    expect((await getAiProject(7)).aiProject.profile).toBeNull();
  });

  it("stores the chosen model of a new project, and none for the default", async () => {
    route({
      "POST /files/rooms": folder({ aiProject: undefined }),
      "PUT /ai/projects/7/model": ({ data }: { data?: unknown }) => {
        expect(data).toEqual({ profileId: "p1" });
        return { profile: PROFILE };
      },
    });
    expect((await createAiProject({ title: "Sales", aiProject: { profileId: "p1" } })).aiProject.profile).toEqual(PROFILE);

    request.mockClear();
    await createAiProject({ title: "Sales", aiProject: { profileId: null } });
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ url: "/ai/projects/7/model" }));
  });

  it("writes the model on an update and keeps the save when it is refused", async () => {
    route({
      "PUT /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "PUT /ai/projects/7/model": () => {
        throw { response: { data: { error: "AI profile does not support chat" } } };
      },
      "GET /ai/projects/7/model": { profile: null },
    });
    const project = await updateAiProject(7, { title: "Sales", aiProject: { profileId: "p2" } });
    expect(project.aiProject.profile).toBeNull();
    expect(project.aiProject.warnings).toEqual([
      { code: "modelNotSaved", roomId: null, subjectId: null, message: "AI profile does not support chat" },
    ]);
  });

  it("prefixes the linked rooms' colours in the skills list", async () => {
    request.mockResolvedValueOnce({ rooms: [{ id: 12, logo: { color: "AABBCC" } }, { id: 13, logo: null }] });
    const skills = await getAiProjectSkills(7);
    expect(request).toHaveBeenLastCalledWith({ method: "GET", url: "/files/rooms/7/skills" });
    expect(skills.map((room) => room.logo?.color ?? null)).toEqual(["#AABBCC", null]);
  });

  it("lists the knowledge files of every linked Knowledge room, an unreadable one as unavailable", async () => {
    route({
      "GET /files/rooms/7/sources": {
        instructionsRooms: [],
        knowledgeRooms: [
          { id: 9, title: "Docs", logo: { color: "#DDEEFF" } },
          { id: 10, title: "Gone", logo: null },
        ],
      },
      "GET /files/9?filterType=1&count=100&startIndex=0": {
        total: 3,
        files: [
          { id: 1, title: "a.pdf", fileExst: ".pdf", vectorizationStatus: 1, security: { Vectorization: true } },
          { id: 2, title: "b.docx", vectorizationStatus: 2 },
          { id: 3, title: "c.txt", vectorizationStatus: null },
        ],
      },
      "GET /files/10?filterType=1&count=100&startIndex=0": () => {
        throw new Error("403");
      },
    });
    const knowledge = await getAiProjectKnowledge(7);
    expect(knowledge[0]).toMatchObject({
      id: 9,
      available: true,
      totalFiles: 3,
      indexedFiles: 1,
      failedFiles: 1,
      truncated: false,
      logo: { color: "#DDEEFF" },
    });
    expect(knowledge[0].files[1]).toEqual({
      id: 2,
      title: "b.docx",
      fileExst: ".docx",
      indexed: false,
      vectorizationStatus: 2,
      security: { Vectorization: false },
    });
    expect(knowledge[1]).toMatchObject({ id: 10, available: false, files: [] });
  });
});
