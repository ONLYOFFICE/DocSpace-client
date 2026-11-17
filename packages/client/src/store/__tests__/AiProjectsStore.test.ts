import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  createAiProject: vi.fn(),
  getAiProject: vi.fn(),
  getAiProjectKnowledgeFiles: vi.fn(),
  getAiProjectKnowledgeFilesCount: vi.fn(),
  getAiProjectSkills: vi.fn(),
  getAiProjectSummary: vi.fn(),
  getDefaultChatModelName: vi.fn(async () => null as string | null),
  toAiProjectSummary: vi.fn((p: { aiProject: { profile?: { name?: string } | null } }) => ({
    model: p.aiProject.profile?.name ?? null,
    modelAvailable: true,
    skills: ["from project"],
    knowledge: [],
  })),
  refreshAiProjectSettings: vi.fn(),
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

const presets = { setActivePreset: vi.fn(), fetchPresets: vi.fn(async () => {}) };
const userStore = { user: { id: "me" } } as unknown as UserStore;
const createStore = () => new AiProjectsStore(presets as unknown as AiPresetsStore, userStore);

describe("AiProjectsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAiProjectSkills.mockResolvedValue([{ id: 12, title: "Skills", skills: [] }]);
    api.getAiProjectKnowledgeFiles.mockResolvedValue([]);
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

    it("opens nothing by id once the project was left or another opened", async () => {
      let resolveRead: (p: TAiProject) => void = () => {};
      const pending = () =>
        api.getAiProject.mockImplementationOnce(
          () => new Promise<TAiProject>((resolve) => (resolveRead = resolve)),
        );
      const store = createStore();

      pending();
      const left = store.openProjectById(5);
      store.closeProject();
      resolveRead(project(5));
      expect(await left).toBeNull();
      expect(store.activeProject).toBeNull();

      pending();
      const replaced = store.openProjectById(5);
      await store.openProject(project(6));
      resolveRead(project(5));
      expect(await replaced).toBeNull();
      expect(store.activeProject?.id).toBe(6);
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

      api.getAiProjectKnowledgeFiles.mockResolvedValueOnce([{ id: 1, title: "a.docx" }]);
      await store.fetchKnowledgeFiles(9);
      expect(api.getAiProjectKnowledgeFiles).toHaveBeenCalledWith(9);
      expect(store.knowledge).toEqual({ 9: [{ id: 1, title: "a.docx" }] });
      expect(store.skillsPending).toBe(false);
      expect(store.knowledgePending[9]).toBe(false);
    });

    it("reads the skills without a toast when nobody asked, and with one for an expanded room", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectSkills.mockRejectedValue(new Error("gone"));

      await store.fetchSkills(1, { silent: true });
      expect(toastr.error).not.toHaveBeenCalled();

      await store.fetchSkills(1);
      expect(toastr.error).toHaveBeenCalledTimes(1);
    });

    it("keeps the skills pending until the latest read ends, whichever ends first", async () => {
      const store = createStore();
      await store.openProject(project(1));
      let resolveOlder: (rooms: unknown) => void = () => {};
      let resolveLatest: (rooms: unknown) => void = () => {};
      api.getAiProjectSkills
        .mockImplementationOnce(() => new Promise((resolve) => (resolveOlder = resolve)))
        .mockImplementationOnce(() => new Promise((resolve) => (resolveLatest = resolve)));

      const older = store.fetchSkills(1, { silent: true });
      const latest = store.fetchSkills(1);

      resolveOlder([]);
      await older;
      expect(store.skillsPending).toBe(true);

      resolveLatest([{ id: 12, title: "Skills", skills: [] }]);
      await latest;
      expect(store.skillsPending).toBe(false);
      expect(store.skills).toEqual([{ id: 12, title: "Skills", skills: [] }]);
    });

    it("counts the Knowledge rooms' files for the open project, leaving a failed room uncounted", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectKnowledgeFilesCount.mockImplementation(async (roomId: number) => {
        if (roomId === 31) throw new Error("gone");
        return roomId === 30 ? 7 : 0;
      });

      await store.fetchKnowledgeCounts(1, [30, 31, 32]);

      expect(store.knowledgeCounts).toEqual({ 30: 7, 32: 0 });
      expect(toastr.error).not.toHaveBeenCalled();

      // A count that lands after another project was opened is dropped, and
      // opening resets what the previous project counted.
      await store.openProject(project(2));
      expect(store.knowledgeCounts).toEqual({});
      await store.fetchKnowledgeCounts(1, [30]);
      expect(store.knowledgeCounts).toEqual({});
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

    it("follows the model and rooms changed elsewhere, and leaves an unchanged project alone", async () => {
      const store = createStore();
      await store.openProject(project(1));
      const opened = store.activeProject as TAiProject;
      api.refreshAiProjectSettings.mockImplementationOnce(async (current: TAiProject) => current);

      await store.refreshActiveSettings();
      expect(store.activeProject).toBe(opened);

      store.knowledge = { 5: [], 6: [] };
      const knowledgeRoom = { id: 6, title: "Docs", roomType: 11, available: true, archived: false };
      const gpt = { id: "p2", name: "GPT", provider: "openai", available: true };
      const updated = { ...opened, aiProject: { ...opened.aiProject, profile: gpt, knowledgeRooms: [knowledgeRoom] } };
      api.refreshAiProjectSettings.mockResolvedValueOnce(updated);
      presets.setActivePreset.mockClear();

      await store.refreshActiveSettings();
      expect(api.refreshAiProjectSettings).toHaveBeenLastCalledWith(opened);
      expect(store.activeProject).toEqual(updated);
      expect(Object.keys(store.knowledge)).toEqual(["6"]);
      expect(presets.setActivePreset).toHaveBeenCalledTimes(1);
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
      // The sidebar's Agents lists the latest projects.
      expect(presets.fetchPresets).toHaveBeenCalled();
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

    it("saves the Skill sets the chat connected and disconnected, one change after another", async () => {
      const store = createStore();
      await store.openProject(project(1));
      const linked = (ids: number[]) =>
        project(1, "Project 1", {
          aiProject: {
            ...project(1).aiProject,
            instructionsRooms: ids.map((id) => ({ id, title: `Room ${id}`, available: true })),
          } as TAiProject["aiProject"],
        });
      api.updateAiProject.mockResolvedValueOnce(linked([12, 13])).mockResolvedValueOnce(linked([13]));

      const first = store.changeActiveSkillRooms({ added: [{ id: "13" }], removed: [] });
      const second = store.changeActiveSkillRooms({ added: [], removed: ["12"] });

      expect(await first).toBe(true);
      expect(await second).toBe(true);
      expect(api.updateAiProject.mock.calls[0][1].aiProject.instructionsRoomIds).toEqual([12, 13]);
      // The second change starts from what the first one saved.
      expect(api.updateAiProject.mock.calls[1][1].aiProject.instructionsRoomIds).toEqual([13]);
      expect(store.activeProject?.aiProject.instructionsRooms.map((room) => room.id)).toEqual([13]);
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(expect.objectContaining({ id: "1" }));
    });

    it("writes nothing for a Skill sets change the project already has, and reports a refused save", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.updateAiProject.mockClear();

      expect(await store.changeActiveSkillRooms({ added: [{ id: "12" }], removed: ["99"] })).toBe(true);
      expect(api.updateAiProject).not.toHaveBeenCalled();

      api.updateAiProject.mockRejectedValueOnce(new Error("refused"));
      expect(await store.changeActiveSkillRooms({ added: [], removed: ["12"] })).toBe(false);
      expect(toastr.error).toHaveBeenCalled();
      expect(store.activeProject?.aiProject.instructionsRooms.map((room) => room.id)).toEqual([12]);
    });

    it("saves a Skill sets change of an agent picked in the chat panel from the agent as the server has it", async () => {
      const store = createStore();
      const picked = { ...presets, activePreset: { id: "7" } };
      const panelStore = new AiProjectsStore(picked as unknown as AiPresetsStore, userStore);
      api.getAiProject.mockResolvedValueOnce(project(7));
      api.updateAiProject.mockResolvedValueOnce(
        project(7, "Project 7", {
          aiProject: { ...project(7).aiProject, instructionsRooms: [] } as TAiProject["aiProject"],
        }),
      );

      expect(await panelStore.changeSkillRooms(7, { added: [], removed: ["12"] })).toBe(true);
      expect(api.getAiProject).toHaveBeenCalledWith(7);
      expect(api.updateAiProject.mock.calls[0][1].aiProject.instructionsRoomIds).toEqual([]);
      // The picked agent follows the saved one.
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(expect.objectContaining({ id: "7", contextRooms: [] }));

      // An agent the user may not change is not saved, nor one that cannot be read.
      api.getAiProject.mockResolvedValueOnce(
        project(8, "Project 8", {
          aiProject: { ...project(8).aiProject, canEditSettings: false } as TAiProject["aiProject"],
        }),
      );
      expect(await store.changeSkillRooms(8, { added: [], removed: ["12"] })).toBe(false);
      api.getAiProject.mockRejectedValueOnce(new Error("gone"));
      expect(await store.changeSkillRooms(9, { added: [], removed: ["12"] })).toBe(false);
      expect(toastr.error).toHaveBeenCalled();
      expect(api.updateAiProject).toHaveBeenCalledTimes(1);
    });

    it("drops the uploaded logo after an update that removed it", async () => {
      const store = createStore();
      api.updateAiProject.mockResolvedValue(project(1));
      roomsApi.removeLogoFromRoom.mockResolvedValue({ id: 1, title: "No logo" });

      const result = await store.updateProject(1, { title: "x" } as never, { removeLogo: true });

      expect(roomsApi.removeLogoFromRoom).toHaveBeenCalledWith(1);
      expect(api.toAiProject).toHaveBeenCalledWith({ id: 1, title: "No logo" });
      // The logo route answers the bare room: the model and the linked rooms
      // the update read are kept.
      expect(result).toEqual({ id: 1, title: "No logo", aiProject: project(1).aiProject });
    });

    it("hands the project over, and leaves it unless the owner stays on", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProject.mockResolvedValueOnce(project(1, "Handed over"));

      await store.changeOwner(project(1), "u2", true);
      expect(filesApi.setFileOwner).toHaveBeenCalledWith("u2", [1]);
      expect(roomsApi.updateRoomMemberRole).not.toHaveBeenCalled();
      expect(presets.fetchPresets).not.toHaveBeenCalled();
      expect(store.activeProject?.title).toBe("Handed over");

      await store.changeOwner(project(1), "u3", false);
      expect(roomsApi.updateRoomMemberRole).toHaveBeenCalledWith(1, {
        invitations: [{ id: "me", access: expect.anything() }],
      });
      expect(store.activeProject).toBeNull();
      // The left project leaves the sidebar's agents.
      expect(presets.fetchPresets).toHaveBeenCalledTimes(1);
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
      expect(api.getAiProject).toHaveBeenCalledWith(5, { requireModel: true });
      expect(store.projectDialog).toEqual({ mode: "edit", project: project(5) });

      await store.openProject(project(1));
      await store.openEditDialogById(1);
      expect(api.getAiProject).toHaveBeenCalledTimes(1);
      expect(store.projectDialog?.mode === "edit" && store.projectDialog.project.id).toBe(1);

      api.getAiProject.mockRejectedValueOnce(new Error("no"));
      await store.openEditDialogById(7);
      expect(toastr.error).toHaveBeenCalledWith("no");
    });

    it("keeps the edit form on the project it opened while the project changes elsewhere", async () => {
      const store = createStore();
      await store.openProject(project(1));
      store.openEditDialog(project(1));
      const elsewhere = project(1, "Renamed elsewhere");
      api.refreshAiProjectSettings.mockResolvedValue(elsewhere);

      await store.refreshActiveSettings();

      expect(store.activeProject?.title).toBe("Renamed elsewhere");
      expect(store.projectDialog).toEqual({ mode: "edit", project: project(1) });
    });

    it("shows the new owner in the open form, keeping what it edits", async () => {
      const store = createStore();
      store.openEditDialog(project(1));
      api.getAiProject.mockResolvedValue(
        project(1, "Renamed elsewhere", { createdBy: { id: "u2" }, access: 9 } as Partial<TAiProject>),
      );

      await store.changeOwner(project(1), "u2", true);

      const form = store.projectDialog?.mode === "edit" ? store.projectDialog.project : null;
      expect(form?.createdBy).toEqual({ id: "u2" });
      expect(form?.access).toBe(9);
      expect(form?.title).toBe("Project 1");
    });

    it("reads a project whose model could not be read before the form opens on it", async () => {
      const unread = project(1, "Project 1", {
        aiProject: { ...project(1).aiProject, profile: null, modelUnread: true },
      });
      api.getAiProject.mockResolvedValueOnce(project(1));
      const store = createStore();

      store.openEditDialog(unread);
      expect(store.projectDialog).toBeNull();
      await vi.waitFor(() => expect(store.projectDialog).toEqual({ mode: "edit", project: project(1) }));
      expect(api.getAiProject).toHaveBeenCalledWith(1, { requireModel: true });
    });

    it("opens no form when the model still cannot be read", async () => {
      const unread = project(1, "Project 1", {
        aiProject: { ...project(1).aiProject, profile: null, modelUnread: true },
      });
      const store = createStore();
      await store.openProject(unread);
      api.getAiProject.mockRejectedValueOnce(new Error("model refused"));

      await store.openEditDialogById(1);

      expect(api.getAiProject).toHaveBeenCalledWith(1, { requireModel: true });
      expect(toastr.error).toHaveBeenCalledWith("model refused");
      expect(store.projectDialog).toBeNull();
    });

    it("keeps the edit form on the project as the server has it after a save", async () => {
      const store = createStore();
      store.openEditDialog(project(1));
      const updated = project(1, "Renamed");
      api.updateAiProject.mockResolvedValue(updated);

      await store.updateProject(1, { title: "Renamed" } as never);

      expect(store.projectDialog).toEqual({ mode: "edit", project: updated });
      // The views that read the project themselves are told it moved.
      expect(store.projectRevisions[1]).toBe(1);
    });
  });

  describe("retryKnowledgeFile", () => {
    const knowledge = () => [
      { id: 1, title: "a.docx", vectorizationStatus: VectorizationStatus.Failed },
      { id: 2, title: "b.docx", vectorizationStatus: VectorizationStatus.Completed },
    ];

    it("queues the file again, shown in progress at once", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectKnowledgeFiles.mockResolvedValueOnce(knowledge());
      await store.fetchKnowledgeFiles(30);
      aiApi.retryVectorization.mockResolvedValue(undefined);

      await store.retryKnowledgeFile(30, 1);

      expect(aiApi.retryVectorization).toHaveBeenCalledWith([1]);
      expect(store.knowledge[30][0].vectorizationStatus).toBe(VectorizationStatus.InProgress);
    });

    it("puts the file back to failed when the request is refused", async () => {
      const store = createStore();
      await store.openProject(project(1));
      api.getAiProjectKnowledgeFiles.mockResolvedValueOnce(knowledge());
      await store.fetchKnowledgeFiles(30);
      aiApi.retryVectorization.mockRejectedValue(new Error("busy"));

      await store.retryKnowledgeFile(30, 1);

      expect(store.knowledge[30][0].vectorizationStatus).toBe(VectorizationStatus.Failed);
      expect(toastr.error).toHaveBeenCalledWith("busy");
    });
  });

  describe("the tile summaries", () => {
    const summary = { model: "Claude", modelAvailable: true, skills: ["Legal"], knowledge: ["Wiki"] };

    it("reads the portal's chat model once for the tiles of agents without their own", async () => {
      api.getAiProjectSummary.mockResolvedValue(summary);
      api.getDefaultChatModelName.mockResolvedValue("GLM 5.3 Flash");
      const store = createStore();
      await Promise.all([store.fetchTileSummary(1), store.fetchTileSummary(2)]);
      await store.fetchDefaultModel();
      expect(store.defaultModelName).toBe("GLM 5.3 Flash");
      expect(api.getDefaultChatModelName).toHaveBeenCalledTimes(1);
    });

    it("reads a project's summary once, however many tiles ask", async () => {
      api.getAiProjectSummary.mockResolvedValue(summary);
      const store = createStore();
      await Promise.all([store.fetchTileSummary(7), store.fetchTileSummary(7)]);
      await store.fetchTileSummary(7);

      expect(api.getAiProjectSummary).toHaveBeenCalledTimes(1);
      expect(store.tileSummaries[7]).toEqual(summary);
    });

    it("tries a failed read again for the next tile that asks", async () => {
      api.getAiProjectSummary.mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce(summary);
      const store = createStore();
      await store.fetchTileSummary(7);
      expect(store.tileSummaries[7]).toBeUndefined();

      await store.fetchTileSummary(7);
      expect(store.tileSummaries[7]).toEqual(summary);
    });

    it("takes the summary of a project saved in the form, without a read", async () => {
      api.updateAiProject.mockResolvedValue(project(7));
      const store = createStore();
      await store.updateProject(7, { title: "Renamed" });

      expect(store.tileSummaries[7]).toMatchObject({ model: "Claude", skills: ["from project"] });
      await store.fetchTileSummary(7);
      expect(api.getAiProjectSummary).not.toHaveBeenCalled();
    });

    it("reads the summaries and the portal's model again once the list is read again, showing the old ones meanwhile", async () => {
      api.getAiProjectSummary.mockResolvedValue(summary);
      api.getDefaultChatModelName.mockResolvedValue("GLM 5.3 Flash");
      const store = createStore();
      await store.fetchTileSummary(7);
      await store.fetchDefaultModel();

      store.refreshTileSummaries();
      expect(store.tileSummaries[7]).toEqual(summary);
      const renamed = { ...summary, skills: ["Contracts"] };
      api.getAiProjectSummary.mockResolvedValue(renamed);
      api.getDefaultChatModelName.mockResolvedValue("Claude");
      await store.fetchTileSummary(7);
      await store.fetchDefaultModel();

      expect(api.getAiProjectSummary).toHaveBeenCalledTimes(2);
      expect(store.tileSummaries[7]).toEqual(renamed);
      expect(store.defaultModelName).toBe("Claude");
      // Read once per read of the list.
      await store.fetchTileSummary(7);
      expect(api.getAiProjectSummary).toHaveBeenCalledTimes(2);
    });

    it("reads a shown summary again when its project changes, and drops it when the project is gone", async () => {
      api.getAiProjectSummary.mockResolvedValue(summary);
      const store = createStore();
      // Never shown: nothing to read again.
      await store.refreshTileSummary(7);
      expect(api.getAiProjectSummary).not.toHaveBeenCalled();

      await store.fetchTileSummary(7);
      const changed = { ...summary, model: "GPT" };
      api.getAiProjectSummary.mockResolvedValue(changed);
      await store.refreshTileSummary(7);
      expect(store.tileSummaries[7]).toEqual(changed);

      store.forgetTileSummary(7);
      expect(store.tileSummaries[7]).toBeUndefined();
    });
  });
});
