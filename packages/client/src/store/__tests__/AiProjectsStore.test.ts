import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
  updateAiProject: vi.fn(),
  deleteAiProject: vi.fn(),
  duplicateAiProject: vi.fn(),
  pinAiProject: vi.fn(),
  muteAiProject: vi.fn(),
  leaveAiProject: vi.fn(),
  changeAiProjectOwner: vi.fn(),
  getAiProjectSkills: vi.fn(),
  getAiProjectKnowledge: vi.fn(),
}));

const { toastr, socket, getOperationProgress } = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
  getOperationProgress: vi.fn(),
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: socket,
}));
vi.mock("@docspace/shared/utils/getOperationProgress", () => ({ getOperationProgress }));

import { SocketCommands, SocketEvents } from "@onlyoffice/apps-ui-kit/utils/socket";

import type AiPresetsStore from "../AiPresetsStore";
import AiProjectsStore, { errorMessage } from "../AiProjectsStore";

const project = (id: number, title = `Project ${id}`, extra: Partial<TAiProject> = {}): TAiProject =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
    pinned: false,
    mute: false,
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

const page = (folders: TAiProject[], total = folders.length, rootId = 100) => ({
  folders,
  total,
  current: { id: rootId },
});

const presets = { setActivePreset: vi.fn() };
const createStore = () => new AiProjectsStore(presets as unknown as AiPresetsStore);

/** The `s:modify-folder` handler the store registered. */
const modifyFolder = () => {
  const call = socket.on.mock.calls.find(([event]) => event === SocketEvents.ModifyFolder);
  if (!call) throw new Error("not listening");
  return call[1] as (opt: Record<string, unknown>) => void;
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("AiProjectsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socket.socketSubscribers.clear();
    window.localStorage.clear();
    api.getAiProjects.mockResolvedValue(page([project(1), project(2)]));
    api.getAiProjectSkills.mockResolvedValue([{ id: 12, title: "Skills", skills: [] }]);
    api.getAiProjectKnowledge.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("errorMessage", () => {
    it("prefers the server's text, whichever backend wrote it", () => {
      expect(errorMessage({ response: { data: { error: "Node said no" } } })).toBe("Node said no");
      expect(errorMessage({ response: { data: { error: { message: "C# said no" } } } })).toBe(
        "C# said no",
      );
      expect(errorMessage(new Error("offline"))).toBe("offline");
      expect(errorMessage("plain")).toBe("plain");
    });
  });

  describe("the list", () => {
    it("loads the first page and remembers the projects root", async () => {
      const store = createStore();
      expect(store.hasMoreProjects).toBe(false);
      await store.fetchProjects();
      expect(api.getAiProjects).toHaveBeenCalledWith({
        filterValue: undefined,
        subjectId: undefined,
        instructionsRoomId: undefined,
        knowledgeRoomId: undefined,
        sortBy: "DateAndTime",
        sortOrder: "descending",
        startIndex: 0,
        count: 100,
      });
      expect(store.projects.map((p) => p.id)).toEqual([1, 2]);
      expect(store.isLoaded).toBe(true);
      expect(store.isLoading).toBe(false);
      expect(store.rootId).toBe(100);
    });

    it("queries by the search, the filters and the sort", async () => {
      const store = createStore();
      store.setFilterValue("  sa ");
      store.setSort("AZ", "ascending");
      store.setFilterOptions({
        owner: { id: "u1", label: "Ann" },
        instructionsRoom: { id: "12", label: "Skills" },
      });
      await flush();
      expect(store.isFiltered).toBe(true);
      expect(store.hasFilterOptions).toBe(true);
      expect(api.getAiProjects).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filterValue: "sa",
          subjectId: "u1",
          instructionsRoomId: 12,
          knowledgeRoomId: undefined,
          sortBy: "AZ",
          sortOrder: "ascending",
        }),
      );

      store.clearFilter();
      await flush();
      expect(store.isFiltered).toBe(false);
      expect(api.getAiProjects).toHaveBeenLastCalledWith(
        expect.objectContaining({ filterValue: undefined, subjectId: undefined }),
      );
    });

    it("appends the next page without duplicates and stops at the total", async () => {
      api.getAiProjects.mockResolvedValueOnce(page([project(1), project(2)], 3));
      const store = createStore();
      await store.fetchProjects();
      expect(store.hasMoreProjects).toBe(true);

      api.getAiProjects.mockResolvedValueOnce(page([project(2), project(3)], 3));
      await store.fetchMoreProjects();
      expect(api.getAiProjects).toHaveBeenLastCalledWith(
        expect.objectContaining({ startIndex: 2, count: 100 }),
      );
      expect(store.projects.map((p) => p.id)).toEqual([1, 2, 3]);
      expect(store.hasMoreProjects).toBe(false);
      expect(store.isFetchingMore).toBe(false);

      await store.fetchMoreProjects();
      expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    });

    it("lets a newer search win over an older answer", async () => {
      let resolveFirst: (value: unknown) => void = () => {};
      api.getAiProjects.mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      );
      api.getAiProjects.mockResolvedValueOnce(page([project(9, "Newer")]));
      const store = createStore();
      const first = store.fetchProjects();
      await store.fetchProjects();
      resolveFirst(page([project(1, "Older")]));
      await first;
      expect(store.projects.map((p) => p.title)).toEqual(["Newer"]);
      expect(store.isLoading).toBe(false);
    });

    it("reports a failed load and keeps the list", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.getAiProjects.mockRejectedValueOnce({ response: { data: { error: "boom" } } });
      await store.fetchProjects();
      expect(toastr.error).toHaveBeenCalledWith("boom");
      expect(store.projects).toHaveLength(2);
      expect(store.isLoading).toBe(false);
    });

    it("keeps the view in local storage", () => {
      const store = createStore();
      expect(store.viewAs).toBe("table");
      store.setViewAs("tile");
      expect(window.localStorage.getItem("aiProjectsViewAs")).toBe("tile");
      expect(createStore().viewAs).toBe("tile");
      window.localStorage.setItem("aiProjectsViewAs", "weird");
      expect(createStore().viewAs).toBe("table");
    });
  });

  describe("the open project", () => {
    it("hands the project to the chat as the preset; the sources are read on demand", async () => {
      const store = createStore();
      await store.openProject(project(1));
      expect(presets.setActivePreset).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          profileId: "p1",
          contextRooms: [{ cloud: "docspace", id: "12", name: "Skills" }],
        }),
      );
      // Opening reads no sources: a card reads its room's list when expanded.
      expect(api.getAiProjectSkills).not.toHaveBeenCalled();
      expect(api.getAiProjectKnowledge).not.toHaveBeenCalled();
      expect(store.skills).toEqual([]);
      await store.fetchSkills(1);
      expect(store.skills).toEqual([{ id: 12, title: "Skills", skills: [] }]);
      expect(store.knowledge).toEqual([]);

      store.closeProject();
      expect(store.activeProject).toBeNull();
      expect(presets.setActivePreset).toHaveBeenLastCalledWith(null);
    });

    it("opens by id from the list, else from the server, and reports a miss", async () => {
      const store = createStore();
      await store.fetchProjects();
      await store.openProjectById(2);
      expect(api.getAiProject).not.toHaveBeenCalled();
      expect(store.activeProject?.id).toBe(2);

      api.getAiProject.mockResolvedValueOnce(project(5));
      await store.openProjectById(5);
      expect(store.activeProject?.id).toBe(5);

      api.getAiProject.mockRejectedValueOnce(new Error("404"));
      await store.openProjectById(6);
      expect(toastr.error).toHaveBeenCalledWith("404");
      expect(store.activeProject?.id).toBe(5);
    });

    it("keeps the sources of the project that is open now", async () => {
      let resolveSkills: (value: unknown) => void = () => {};
      api.getAiProjectSkills.mockImplementationOnce(
        () => new Promise((resolve) => (resolveSkills = resolve)),
      );
      const store = createStore();
      await store.openProject(project(1));
      const first = store.fetchSkills(1);
      await store.openProject(project(2));
      await store.fetchSkills(2);
      resolveSkills([{ id: 99, title: "Stale" }]);
      await first;
      expect(store.skills).toEqual([{ id: 12, title: "Skills", skills: [] }]);
    });
  });

  describe("the mutations", () => {
    it("puts a created project first and shows the server's warnings", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.createAiProject.mockResolvedValueOnce(
        project(3, "New", {
          aiProject: {
            profile: null,
            instructionsRooms: [],
            knowledgeRooms: [],
            canEditSettings: true,
            warnings: [{ code: "grantSkipped", message: "Viewer skipped", roomId: 12, subjectId: "u2" }],
          },
        }),
      );
      await store.createProject({ title: "New" });
      expect(store.projects.map((p) => p.id)).toEqual([3, 1, 2]);
      expect(store.total).toBe(3);
      expect(toastr.warning).toHaveBeenCalledWith("Viewer skipped");
    });

    it("replaces an updated project everywhere, re-syncing the open one", async () => {
      const store = createStore();
      await store.fetchProjects();
      await store.openProject(store.projects[0]);
      store.openEditDialog(store.projects[0]);
      vi.clearAllMocks();
      api.getAiProjectSkills.mockResolvedValue([]);
      api.getAiProjectKnowledge.mockResolvedValue([]);
      api.updateAiProject.mockResolvedValueOnce(project(1, "Renamed"));

      await store.updateProject(1, { title: "Renamed" });
      expect(store.projects[0].title).toBe("Renamed");
      expect(store.activeProject?.title).toBe("Renamed");
      expect(store.projectDialog).toEqual({ mode: "edit", project: store.projects[0] });
      expect(presets.setActivePreset).toHaveBeenCalledWith(expect.objectContaining({ name: "Renamed" }));
      // The sources are not re-read: an open card reads them again on its next expand.
      expect(api.getAiProjectSkills).not.toHaveBeenCalled();
    });

    it("follows the delete operation, then drops the project and closes it", async () => {
      const store = createStore();
      await store.fetchProjects();
      await store.openProject(store.projects[0]);
      api.deleteAiProject.mockResolvedValueOnce({ id: "op", finished: false });
      getOperationProgress.mockResolvedValueOnce({ id: "op", finished: true });

      await store.removeProject(store.projects[0]);
      expect(getOperationProgress).toHaveBeenCalledWith("op", "", true);
      expect(store.projects.map((p) => p.id)).toEqual([2]);
      expect(store.total).toBe(1);
      expect(store.activeProject).toBeNull();
    });

    it("surfaces a failed operation", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.deleteAiProject.mockResolvedValueOnce({ id: "op", finished: true, error: "locked" });
      await expect(store.removeProject(store.projects[0])).rejects.toThrow("locked");
      expect(store.projects).toHaveLength(2);
    });

    it("re-reads the list once a duplicate has landed", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.duplicateAiProject.mockResolvedValueOnce({ id: "op", finished: true });
      await store.duplicateProject(store.projects[0]);
      expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    });

    it("switches notifications and the pin in place", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.muteAiProject.mockResolvedValueOnce(undefined);
      await store.toggleMute(store.projects[0]);
      expect(api.muteAiProject).toHaveBeenCalledWith(1, true);
      expect(store.projects[0].mute).toBe(true);

      api.pinAiProject.mockResolvedValueOnce(project(1, "Project 1", { pinned: true }));
      await store.togglePin(store.projects[0]);
      expect(api.pinAiProject).toHaveBeenCalledWith(1, true);
      expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    });

    it("drops a left project, and one handed over without staying on", async () => {
      const store = createStore();
      await store.fetchProjects();
      store.openEditDialog(store.projects[0]);
      await store.leaveProject(store.projects[0]);
      expect(store.projects.map((p) => p.id)).toEqual([2]);
      expect(store.projectDialog).toBeNull();

      await store.changeOwner(store.projects[0], "u2", false);
      expect(api.changeAiProjectOwner).toHaveBeenCalledWith(2, "u2", false);
      expect(store.projects).toEqual([]);
      expect(store.total).toBe(0);
    });

    it("re-reads a project handed over while staying as a manager", async () => {
      const store = createStore();
      await store.fetchProjects();
      api.getAiProject.mockResolvedValueOnce(project(1, "Project 1", { access: 9 }));
      await store.changeOwner(store.projects[0], "u2", true);
      expect(store.projects[0].access).toBe(9);
      expect(store.projects).toHaveLength(2);
    });
  });

  describe("the dialogs", () => {
    it("opens and closes each one", () => {
      const store = createStore();
      const p = project(1);
      store.openCreateDialog();
      expect(store.projectDialog).toEqual({ mode: "create" });
      store.openEditDialog(p);
      expect(store.projectDialog).toEqual({ mode: "edit", project: p });
      store.closeProjectDialog();
      expect(store.projectDialog).toBeNull();
      store.openDelete(p);
      expect(store.deleteFor).toEqual(p);
      store.closeDelete();
      expect(store.deleteFor).toBeNull();
      store.openLeave(p);
      expect(store.leaveFor).toEqual(p);
      store.closeLeave();
      expect(store.leaveFor).toBeNull();
    });
  });

  describe("live updates", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("holds the root and the open project's channels while the page is up", async () => {
      const store = createStore();
      store.startLiveUpdates();
      expect(socket.on).toHaveBeenCalledWith(SocketEvents.ModifyFolder, expect.any(Function));
      await store.fetchProjects();
      expect(socket.emit).toHaveBeenCalledWith(SocketCommands.Subscribe, {
        roomParts: ["DIR-100"],
        individual: true,
      });

      await store.openProject(project(1));
      expect(socket.emit).toHaveBeenLastCalledWith(SocketCommands.Subscribe, {
        roomParts: ["DIR-1"],
        individual: true,
      });

      store.closeProject();
      expect(socket.emit).toHaveBeenLastCalledWith(SocketCommands.Unsubscribe, {
        roomParts: ["DIR-1"],
        individual: true,
      });

      store.stopLiveUpdates();
      expect(socket.off).toHaveBeenCalledWith(SocketEvents.ModifyFolder, expect.any(Function));
      expect(socket.emit).toHaveBeenLastCalledWith(SocketCommands.Unsubscribe, {
        roomParts: ["DIR-100"],
        individual: true,
      });
    });

    it("uses a channel someone else holds without taking it over", async () => {
      socket.socketSubscribers.add("DIR-1");
      const store = createStore();
      store.startLiveUpdates();
      await store.openProject(project(1));
      expect(socket.emit).not.toHaveBeenCalledWith(
        SocketCommands.Subscribe,
        expect.objectContaining({ roomParts: ["DIR-1"] }),
      );
      store.closeProject();
      expect(socket.emit).not.toHaveBeenCalledWith(SocketCommands.Unsubscribe, expect.anything());
    });

    it("re-reads the list, once, for projects created under the root", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      const handler = modifyFolder();
      handler({ type: "folder", cmd: "create", id: 3, data: JSON.stringify({ parentId: 100 }) });
      handler({ type: "folder", cmd: "create", id: 4, data: JSON.stringify({ parentId: 100 }) });
      handler({ type: "folder", cmd: "create", id: 5, data: JSON.stringify({ parentId: 55 }) });
      handler({ type: "file", cmd: "create", id: 6, data: JSON.stringify({ parentId: 100 }) });
      expect(api.getAiProjects).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(300);
      expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    });

    it("re-reads a known project someone changed, re-syncing the open one", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      await store.openProject(store.projects[0]);
      const handler = modifyFolder();
      vi.clearAllMocks();
      api.getAiProjectSkills.mockResolvedValue([]);
      api.getAiProjectKnowledge.mockResolvedValue([]);
      api.getAiProject.mockResolvedValueOnce(project(1, "Renamed"));

      handler({ type: "folder", cmd: "update", id: 1 });
      await vi.advanceTimersByTimeAsync(300);
      expect(api.getAiProject).toHaveBeenCalledWith(1);
      expect(store.activeProject?.title).toBe("Renamed");
      expect(presets.setActivePreset).toHaveBeenCalledWith(expect.objectContaining({ name: "Renamed" }));
      // The sources are not re-read: an open card reads them again on its next expand.
      expect(api.getAiProjectSkills).not.toHaveBeenCalled();
    });

    it("drops a deleted project and flags the open one as lost", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      await store.openProject(store.projects[0]);
      modifyFolder()({ type: "folder", cmd: "delete", id: 1 });
      expect(store.projects.map((p) => p.id)).toEqual([2]);
      expect(store.activeProject).toBeNull();
      expect(store.lostProjectId).toBe(1);
      store.clearLostProject();
      expect(store.lostProjectId).toBeNull();
    });

    it("drops a changed project the caller can no longer read", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      await store.openProject(store.projects[1]);
      api.getAiProject.mockRejectedValueOnce({ response: { status: 403 } });
      modifyFolder()({ type: "folder", cmd: "update", id: 2 });
      await vi.advanceTimersByTimeAsync(300);
      expect(store.projects.map((p) => p.id)).toEqual([1]);
      expect(store.lostProjectId).toBe(2);
      expect(store.activeProject).toBeNull();

      api.getAiProject.mockRejectedValueOnce(new Error("offline"));
      modifyFolder()({ type: "folder", cmd: "update", id: 1 });
      await vi.advanceTimersByTimeAsync(300);
      expect(store.projects.map((p) => p.id)).toEqual([1]);
    });

    it("ignores events for projects it does not know", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      modifyFolder()({ type: "folder", cmd: "update", id: 77 });
      modifyFolder()({ type: "folder", cmd: "update", id: "not-a-number" });
      await vi.advanceTimersByTimeAsync(300);
      expect(api.getAiProject).not.toHaveBeenCalled();
      expect(api.getAiProjects).toHaveBeenCalledTimes(1);
    });

    it("forgets pending reloads when the page goes away", async () => {
      const store = createStore();
      store.startLiveUpdates();
      await store.fetchProjects();
      modifyFolder()({ type: "folder", cmd: "update", id: 1 });
      modifyFolder()({ type: "folder", cmd: "create", id: 3, data: JSON.stringify({ parentId: 100 }) });
      store.stopLiveUpdates();
      await vi.advanceTimersByTimeAsync(300);
      expect(api.getAiProject).not.toHaveBeenCalled();
      expect(api.getAiProjects).toHaveBeenCalledTimes(1);
    });
  });
});
