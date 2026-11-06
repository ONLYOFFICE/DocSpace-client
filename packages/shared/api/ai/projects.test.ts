// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn(async (_options: unknown): Promise<unknown> => ({}));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// The AI profiles the project models name: p1 chats, p3 draws images only.
const getProfileById = vi.fn(async (id: string): Promise<unknown> => {
  if (id === "p1") return { id, name: "Claude", providerType: "anthropic", capabilities: 1 };
  if (id === "p3") return { id, name: "Painter", providerType: "openai", capabilities: 2 };
  return null;
});

vi.mock("./index", () => ({
  getProfileById: (id: string) => getProfileById(id),
}));

import {
  AiProjectAccess,
  AI_PROJECT_ROOM_TYPE,
  aiProjectToRoom,
  createAiProject,
  getAiProjectKnowledgeFiles,
  getAiProjects,
  getAiProject,
  getAiProjectSkills,
  refreshAiProjectSettings,
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
      instructions: "",
      suggestions: [],
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

  it("saves an edit from the opened project with only the requests its changes need", async () => {
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
      {
        title: "Sales",
        tags: [],
        logo: { color: "#FF6680", cover: "" },
        aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [9] },
      },
      opened,
    );
    expect(request.mock.calls.map(([config]) => `${(config as { method: string }).method} ${(config as { url: string }).url}`)).toEqual([
      "DELETE /files/rooms/7/sources",
    ]);
    expect(project.title).toBe("Sales");
    expect(project.aiProject.instructionsRooms.map((room) => room.id)).toEqual([12]);
    expect(project.aiProject.knowledgeRooms.map((room) => room.title)).toEqual(["Docs"]);
    expect(project.aiProject.profile?.id).toBe("p1");
  });

  it("takes a newly linked room from the form instead of reading the sources back", async () => {
    const opened = toAiProject(folder({ aiProject: { instructionsRooms: [], knowledgeRooms: [] } }));
    request.mockClear();
    const project = await updateAiProject(
      7,
      {
        aiProject: {
          instructionsRoomIds: [14],
          rooms: [{ id: 14, title: "Skills", roomType: 10, available: true, archived: false, logo: { color: "#123456" } }],
        },
      },
      opened,
    );
    expect(request.mock.calls.map(([config]) => `${(config as { method: string }).method} ${(config as { url: string }).url}`)).toEqual([
      "POST /files/rooms/7/sources",
    ]);
    expect(project.aiProject.instructionsRooms).toEqual([
      expect.objectContaining({ id: 14, title: "Skills", logo: expect.objectContaining({ color: "#123456" }) }),
    ]);
  });

  const PROFILE = { id: "p1", name: "Claude", provider: "anthropic", available: true };

  it("reads the project's model with the room, and the default when it cannot be read", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "GET /files/rooms/7/model": { profileId: "p1" },
    });
    expect((await getAiProject(7)).aiProject.profile).toEqual(PROFILE);

    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
    });
    expect((await getAiProject(7)).aiProject.profile).toBeNull();
  });

  it("re-reads only the model and sources of an open project, keeping it when nothing changed", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources([12]),
      "GET /files/rooms/7/model": { profileId: "p1" },
    });
    const opened = await getAiProject(7);
    request.mockClear();
    getProfileById.mockClear();

    expect(await refreshAiProjectSettings(opened)).toBe(opened);
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ url: "/files/rooms/7" }));
    expect(getProfileById).not.toHaveBeenCalled();

    route({
      "GET /files/rooms/7/sources": sources([12], [9]),
      "GET /files/rooms/7/model": { profileId: "p1" },
    });
    const updated = await refreshAiProjectSettings(opened);
    expect(updated.title).toBe(opened.title);
    expect(updated.aiProject.profile).toBe(opened.aiProject.profile);
    expect(updated.aiProject.knowledgeRooms).toMatchObject([{ id: 9, roomType: 11 }]);
  });

  it("marks a model whose profile is gone or cannot chat as unavailable", async () => {
    for (const profileId of ["p3", "gone"]) {
      route({
        "GET /files/rooms/7": folder({ aiProject: undefined }),
        "GET /files/rooms/7/sources": sources(),
        "GET /files/rooms/7/model": { profileId },
      });
      expect((await getAiProject(7)).aiProject.profile).toMatchObject({ id: profileId, available: false });
    }
  });

  it("stores the chosen model of a new project, and none without one", async () => {
    route({
      "POST /files/rooms": folder({ aiProject: undefined }),
      "PUT /files/rooms/7/model": ({ data }: { data?: unknown }) => {
        expect(data).toEqual({ profileId: "p1" });
        return { profileId: "p1" };
      },
    });
    expect((await createAiProject({ title: "Sales", aiProject: { profileId: "p1" } })).aiProject.profile).toEqual(PROFILE);

    request.mockClear();
    await createAiProject({ title: "Sales", aiProject: { profileId: null } });
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ url: "/files/rooms/7/model" }));
  });

  it("writes the model on an update and keeps the save when it is refused", async () => {
    route({
      "PUT /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "PUT /files/rooms/7/model": () => {
        throw { response: { data: { error: "AI profile does not support chat" } } };
      },
      "GET /files/rooms/7/model": { profileId: null },
    });
    const project = await updateAiProject(7, { title: "Sales", aiProject: { profileId: "p2" } });
    expect(project.aiProject.profile).toBeNull();
    expect(project.aiProject.warnings).toEqual([
      { code: "modelNotSaved", roomId: null, subjectId: null, message: "AI profile does not support chat" },
    ]);
  });

  it("reads the project's instructions with the room, and none when they cannot be read", async () => {
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "GET /files/rooms/7/instructions": { instructions: "Be brief." },
    });
    expect((await getAiProject(7)).aiProject.instructions).toBe("Be brief.");

    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
    });
    expect((await getAiProject(7)).aiProject.instructions).toBe("");
  });

  it("stores the instructions of a new project, and none when they are empty", async () => {
    route({
      "POST /files/rooms": folder({ aiProject: undefined }),
      "PUT /files/rooms/7/instructions": ({ data }: { data?: unknown }) => {
        expect(data).toEqual({ instructions: "Be brief." });
        return { instructions: "Be brief." };
      },
    });
    expect((await createAiProject({ title: "Sales", aiProject: { instructions: "Be brief." } })).aiProject.instructions).toBe(
      "Be brief.",
    );

    request.mockClear();
    await createAiProject({ title: "Sales", aiProject: { instructions: "" } });
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ url: "/files/rooms/7/instructions" }));
  });

  it("writes changed instructions on an edit, skips unchanged ones and keeps the save when refused", async () => {
    const opened = toAiProject(folder({ aiProject: { ...folder().aiProject, instructions: "Old" } }));
    route({
      "PUT /files/rooms/7/instructions": ({ data }: { data?: unknown }) => {
        expect(data).toEqual({ instructions: "" });
        return { instructions: "" };
      },
    });
    const cleared = await updateAiProject(
      7,
      { title: opened.title, aiProject: { instructions: "" } },
      opened,
    );
    expect(cleared.aiProject.instructions).toBe("");

    request.mockClear();
    await updateAiProject(7, { title: opened.title, aiProject: { instructions: "Old" } }, opened);
    expect(request).not.toHaveBeenCalled();

    route({
      "PUT /files/rooms/7/instructions": () => {
        throw { response: { data: { error: "Not allowed" } } };
      },
    });
    const refused = await updateAiProject(7, { title: opened.title, aiProject: { instructions: "New" } }, opened);
    expect(refused.aiProject.instructions).toBe("Old");
    expect(refused.aiProject.warnings).toEqual([
      { code: "instructionsNotSaved", roomId: null, subjectId: null, message: "Not allowed" },
    ]);
  });

  it("reads the project's suggestions with the room, and none when they cannot be read", async () => {
    const chips = [{ name: "Summary", prompt: "Summarize the contracts" }];
    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
      "GET /files/rooms/7/suggestions": { suggestions: chips },
    });
    expect((await getAiProject(7)).aiProject.suggestions).toEqual(chips);

    route({
      "GET /files/rooms/7": folder({ aiProject: undefined }),
      "GET /files/rooms/7/sources": sources(),
    });
    expect((await getAiProject(7)).aiProject.suggestions).toEqual([]);
  });

  it("stores the suggestions of a new project, and none when there are none", async () => {
    const chips = [{ name: "Summary", prompt: "Summarize the contracts" }];
    route({
      "POST /files/rooms": folder({ aiProject: undefined }),
      "PUT /files/rooms/7/suggestions": ({ data }: { data?: unknown }) => {
        expect(data).toEqual({ suggestions: chips });
        return { suggestions: chips };
      },
    });
    expect((await createAiProject({ title: "Sales", aiProject: { suggestions: chips } })).aiProject.suggestions).toEqual(
      chips,
    );

    request.mockClear();
    await createAiProject({ title: "Sales", aiProject: { suggestions: [] } });
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ url: "/files/rooms/7/suggestions" }));
  });

  it("writes changed suggestions on an edit, skips unchanged ones and keeps the save when refused", async () => {
    const old = [{ name: "Old", prompt: "Old prompt" }];
    const opened = toAiProject(folder({ aiProject: { ...folder().aiProject, suggestions: old } }));

    await updateAiProject(7, { title: opened.title, aiProject: { suggestions: [{ ...old[0] }] } }, opened);
    expect(request).not.toHaveBeenCalled();

    route({
      "PUT /files/rooms/7/suggestions": () => {
        throw { response: { data: { error: "Too many suggestions" } } };
      },
    });
    const refused = await updateAiProject(
      7,
      { title: opened.title, aiProject: { suggestions: [{ name: "New", prompt: "New prompt" }] } },
      opened,
    );
    expect(refused.aiProject.suggestions).toEqual(old);
    expect(refused.aiProject.warnings).toEqual([
      { code: "suggestionsNotSaved", roomId: null, subjectId: null, message: "Too many suggestions" },
    ]);
  });

  it("prefixes the linked rooms' colours in the skills list", async () => {
    request.mockResolvedValueOnce({ rooms: [{ id: 12, logo: { color: "AABBCC" } }, { id: 13, logo: null }] });
    const skills = await getAiProjectSkills(7);
    expect(request).toHaveBeenLastCalledWith({ method: "GET", url: "/files/rooms/7/skills" });
    expect(skills.map((room) => room.logo?.color ?? null)).toEqual(["#AABBCC", null]);
  });

  it("reads a Knowledge room's files with their vectorization state in one request", async () => {
    route({
      "GET /files/9?filterType=1&count=100": {
        total: 3,
        files: [
          { id: 1, title: "a.pdf", fileExst: ".pdf", vectorizationStatus: 1, security: { Vectorization: true } },
          { id: 2, title: "b.docx", vectorizationStatus: 2 },
          { id: 3, title: "c.txt", vectorizationStatus: null },
        ],
      },
    });
    const files = await getAiProjectKnowledgeFiles(9);
    expect(request).toHaveBeenCalledTimes(1);
    expect(files.map((file) => file.indexed)).toEqual([true, false, false]);
    expect(files[1]).toEqual({
      id: 2,
      title: "b.docx",
      fileExst: ".docx",
      indexed: false,
      vectorizationStatus: 2,
      security: { Vectorization: false },
    });
  });
});
