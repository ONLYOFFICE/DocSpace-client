import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  createAiProject: vi.fn(),
  getAiProject: vi.fn(),
  getAiProjectKnowledge: vi.fn(),
  getAiProjectSkills: vi.fn(),
  updateAiProject: vi.fn(),
  toAiProject: vi.fn((dto: Record<string, unknown>) => ({ ...dto, aiProject: {} })),
}));
const roomsApi = vi.hoisted(() => ({
  removeLogoFromRoom: vi.fn(),
  updateRoomMemberRole: vi.fn(),
}));
const filesApi = vi.hoisted(() => ({ setFileOwner: vi.fn() }));
const toastr = vi.hoisted(() => ({
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
}));
const aiApi = vi.hoisted(() => ({ retryVectorization: vi.fn() }));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("@docspace/shared/api/rooms", () => roomsApi);
vi.mock("@docspace/shared/api/files", () => filesApi);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("@docspace/shared/api/ai", () => aiApi);

import { VectorizationStatus } from "@docspace/shared/enums";
import type { UserStore } from "@docspace/shared/store/UserStore";

import type AiPresetsStore from "../AiPresetsStore";
import AiProjectsStore, { errorMessage } from "../AiProjectsStore";

const project = (id: number, title = `Project ${id}`, extra: Partial<TAiProject> = {}): TAiProject =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
    pinned: false,
    mute: false,
    tags: [],
    access: 1,
    security: { EditRoom: true },
    logo: { color: "#FF6680" },
    aiProject: {
      profile: { id: "p1", name: "Claude", available: true },
      instructionsRooms: [{ id: 12, title: "Skills", available: true }],
      knowledgeRooms: [],
      canEditSettings: true,
    },
    ...extra,
  }) as unknown as TAiProject;

/** A project as the Files list hands it over: the room without its project block. */
const listed = (id: number) =>
  project(id, `Project ${id}`, {
    aiProject: {
      profile: null,
      instructionsRooms: [],
      knowledgeRooms: [],
      canEditSettings: false,
      partial: true,
    } as unknown as TAiProject["aiProject"],
  });

const presets = { setActivePreset: vi.fn() };
const userStore = { user: { id: "me" } } as unknown as UserStore;
const createStore = () => new AiProjectsStore(presets as unknown as AiPresetsStore, userStore);

describe("AiProjectsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAiProjectSkills.mockResolvedValue([{ id: 12, title: "Skills", skills: [] }]);
    api.getAiProjectKnowledge.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("errorMessage", () => {
    it("prefers the server's text, whichever backend wrote it", () => {
      expect(errorMessage({ response: { data: { error: "node says no" } }, message: "x" })).toBe("node says no");
      expect(errorMessage({ response: { data: { error: { message: "dotnet says no" } } } })).toBe("dotnet says no");
      expect(errorMessage(new Error("plain"))).toBe("plain");
      expect(errorMessage("text")).toBe("text");
    });
  });

  describe("the open project", () => {
    it("hands a full project to the chat as the preset without a read", async () => {
      const store = createStore();
      const opened = await store.openProject(project(1));

      expect(api.getAiProject).not.toHaveBeenCalled();
      expect(opened.id).toBe(1);
      expect(store.activeProject?.id).toBe(1);
      expect(presets.setActivePreset).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
      expect(api.getAiProjectSkills).not.toHaveBeenCalled();
    });

    it("reads a listed project before the chat opens on its rooms", async () => {
      const full = project(1);
      api.getAiProject.mockResolvedValue(full);
      const store = createStore();

      const opened = await store.openProject(listed(1));

      expect(api.getAiProject).toHaveBeenCalledWith(1);
      expect(opened).toBe(full);
      expect(store.activeProject).toEqual(full);
      expect(presets.setActivePreset).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    });

    it("keeps the project that is open now when an older read lands", async () => {
      let resolveFirst: (p: TAiProject) => void = () => {};
      api.getAiProject.mockImplementationOnce(
        () => new Promise<TAiProject>((resolve) => (resolveFirst = resolve)),
      );
      api.getAiProject.mockResolvedValueOnce(project(2));
      const store = createStore();

      const first = store.openProject(listed(1));
      await store.openProject(listed(2));
      resolveFirst(project(1));
      await first;

      expect(store.activeProject?.id).toBe(2);
    });

    it("opens by id from the server and reports a miss", async () => {
      api.getAiProject.mockResolvedValueOnce(project(3));
      const store = createStore();

      expect((await store.openProjectById(3))?.id).toBe(3);
      expect(await store.openProjectById(3)).toBe(store.activeProject);
      expect(api.getAiProject).toHaveBeenCalledTimes(1);

      api.getAiProject.mockRejectedValueOnce(new Error("gone"));
      expect(await store.openProjectById(4)).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith("gone");
      expect(store.activeProject?.id).toBe(3);
    });

    it("closes the project and resets the preset", async () => {
      const store = createStore();
      await store.openProject(project(1));
      await store.fetchSkills(1);

      store.closeProject();

      expect(store.activeProject).toBeNull();
      expect(store.skills).toEqual([]);
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(null);
    });

    it("reads the sources on demand, for the open project only", async () => {
      const store = createStore();
      await store.openProject(project(1));

      await store.fetchSkills(1);
      expect(store.skills).toEqual([{ id: 12, title: "Skills", skills: [] }]);

      await store.fetchKnowledge(2);
      expect(store.knowledge).toEqual([]);
      expect(store.skillsPending).toBe(false);
      expect(store.knowledgePending).toBe(false);
    });

    it("re-reads the open project and re-syncs the chat", async () => {
      const store = createStore();
      await store.openProject(project(1));
      const renamed = project(1, "Renamed");
      api.getAiProject.mockResolvedValueOnce(renamed);

      await store.refreshActiveProject();

      expect(store.activeProject).toEqual(renamed);
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(expect.objectContaining({ id: "1" }));
    });
  });

  describe("the mutations", () => {
    it("creates a project and shows the server's warnings", async () => {
      const created = project(9, "New", {
        aiProject: {
          ...project(9).aiProject,
          warnings: [{ code: "roomUnavailable", message: "room 5 is gone" }],
        } as TAiProject["aiProject"],
      });
      api.createAiProject.mockResolvedValue(created);
      const store = createStore();

      const result = await store.createProject({ title: "New" } as never);

      expect(result).toBe(created);
      expect(toastr.warning).toHaveBeenCalledWith("room 5 is gone");
      expect(store.activeProject).toBeNull();
    });

    it("replaces an updated open project and re-syncs the chat", async () => {
      const store = createStore();
      await store.openProject(project(1));
      const updated = project(1, "Renamed");
      api.updateAiProject.mockResolvedValue(updated);

      await store.updateProject(1, { title: "Renamed" } as never);

      expect(store.activeProject).toEqual(updated);
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(expect.objectContaining({ id: "1" }));
    });

    it("drops the uploaded logo after an update that removed it", async () => {
      const store = createStore();
      api.updateAiProject.mockResolvedValue(project(1));
      roomsApi.removeLogoFromRoom.mockResolvedValue({ id: 1, title: "No logo" });

      const result = await store.updateProject(1, { title: "x" } as never, { removeLogo: true });

      expect(roomsApi.removeLogoFromRoom).toHaveBeenCalledWith(1);
      expect(api.toAiProject).toHaveBeenCalledWith({ id: 1, title: "No logo" });
      expect(result).toEqual({ id: 1, title: "No logo", aiProject: {} });
    });

    it("hands the project over, and leaves it unless the owner stays on", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProject.mockResolvedValueOnce(project(1, "Handed over"));

      await store.changeOwner(project(1), "u2", true);
      expect(filesApi.setFileOwner).toHaveBeenCalledWith("u2", [1]);
      expect(roomsApi.updateRoomMemberRole).not.toHaveBeenCalled();
      expect(store.activeProject?.title).toBe("Handed over");

      await store.changeOwner(project(1), "u3", false);
      expect(roomsApi.updateRoomMemberRole).toHaveBeenCalledWith(1, {
        invitations: [{ id: "me", access: expect.anything() }],
      });
      expect(store.activeProject).toBeNull();
    });
  });

  describe("the form", () => {
    it("opens create, edit and closes", () => {
      const store = createStore();

      store.openCreateDialog();
      expect(store.projectDialog).toEqual({ mode: "create" });

      store.openEditDialog(project(1));
      expect(store.projectDialog).toEqual({ mode: "edit", project: project(1) });

      store.closeProjectDialog();
      expect(store.projectDialog).toBeNull();
    });

    it("reads a listed room before the edit form opens, else takes the open project", async () => {
      api.getAiProject.mockResolvedValueOnce(project(5));
      const store = createStore();

      await store.openEditDialogById(5);
      expect(api.getAiProject).toHaveBeenCalledWith(5);
      expect(store.projectDialog).toEqual({ mode: "edit", project: project(5) });

      await store.openProject(project(1));
      await store.openEditDialogById(1);
      expect(api.getAiProject).toHaveBeenCalledTimes(1);
      expect(store.projectDialog?.mode === "edit" && store.projectDialog.project.id).toBe(1);

      api.getAiProject.mockRejectedValueOnce(new Error("no"));
      await store.openEditDialogById(7);
      expect(toastr.error).toHaveBeenCalledWith("no");
    });

    it("keeps the edit form on the project as the server has it after a save", async () => {
      const store = createStore();
      store.openEditDialog(project(1));
      const updated = project(1, "Renamed");
      api.updateAiProject.mockResolvedValue(updated);

      await store.updateProject(1, { title: "Renamed" } as never);

      expect(store.projectDialog).toEqual({ mode: "edit", project: updated });
    });
  });

  describe("retryKnowledgeFile", () => {
    const knowledge = () => [
      {
        id: 30,
        title: "Docs",
        failedFiles: 1,
        files: [
          { id: 1, title: "a.docx", vectorizationStatus: VectorizationStatus.Failed },
          { id: 2, title: "b.docx", vectorizationStatus: VectorizationStatus.Completed },
        ],
      },
    ];

    it("queues the file again and clears the room's failed count", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectKnowledge.mockResolvedValueOnce(knowledge());
      await store.fetchKnowledge(1);
      aiApi.retryVectorization.mockResolvedValue(undefined);

      await store.retryKnowledgeFile(30, 1);

      expect(aiApi.retryVectorization).toHaveBeenCalledWith([1]);
      expect(store.knowledge[0].files[0].vectorizationStatus).toBe(VectorizationStatus.InProgress);
      expect(store.knowledge[0].failedFiles).toBe(0);
    });

    it("puts the file back to failed when the request is refused", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectKnowledge.mockResolvedValueOnce(knowledge());
      await store.fetchKnowledge(1);
      aiApi.retryVectorization.mockRejectedValue(new Error("busy"));

      await store.retryKnowledgeFile(30, 1);

      expect(store.knowledge[0].files[0].vectorizationStatus).toBe(VectorizationStatus.Failed);
      expect(store.knowledge[0].failedFiles).toBe(1);
      expect(toastr.error).toHaveBeenCalledWith("busy");
    });
  });
});
