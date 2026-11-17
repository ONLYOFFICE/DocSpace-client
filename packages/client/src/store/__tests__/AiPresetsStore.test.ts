import { describe, it, expect, beforeEach, vi } from "vitest";

import type { TAiProject, TAiProjectSource } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);

import AiPresetsStore, { PRESETS_FRESH_MS, toAiPreset } from "../AiPresetsStore";

const room = (id: number, title: string, available = true): TAiProjectSource =>
  ({ id, title, available, roomType: 10 }) as TAiProjectSource;

const project = (id: number, title: string, overrides: Partial<TAiProject["aiProject"]> = {}) =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
    inRoom: true,
    aiProject: {
      profile: { id: "p1", name: "Claude", available: true },
      instructionsRooms: [room(12, "Skills"), room(13, "Legal tone")],
      knowledgeRooms: [room(9, "Docs"), room(10, "", false)],
      canEditSettings: true,
      ...overrides,
    },
  }) as unknown as TAiProject;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const settings = {
  profileId: "p1",
  profileName: "Claude",
  contextRooms: [
    { cloud: "docspace", id: "12", name: "Skills" },
    { cloud: "google", id: "abc", name: "Drive" },
  ],
  knowledgeRooms: [{ cloud: "docspace", id: "9", name: "Docs" }],
};

describe("AiPresetsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales")] });
  });

  it("takes a project's model and its readable rooms", () => {
    expect(toAiPreset(project(1, "Sales"))).toEqual({
      id: "1",
      name: "Sales",
      createdAt: "2026-10-01T00:00:00.000Z",
      profileId: "p1",
      profileName: "Claude",
      contextRooms: [
        { cloud: "docspace", id: "12", name: "Skills" },
        { cloud: "docspace", id: "13", name: "Legal tone" },
      ],
      knowledgeRooms: [{ cloud: "docspace", id: "9", name: "Docs" }],
      // The fixture may change the settings and carries no room rights.
      rights: { edit: true, share: false, delete: false },
    });
    expect(toAiPreset(project(2, "Default", { profile: null })).profileId).toBeNull();
  });

  it("lists the user's projects, the most recent first, and none without a user", async () => {
    const store = new AiPresetsStore();
    store.init(null);
    expect(api.getAiProjects).not.toHaveBeenCalled();

    store.init("u1");
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: "DateAndTime", sortOrder: "descending" }),
    );
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);
  });

  it("offers a DocSpace admin outside an agent none of it", async () => {
    api.getAiProjects.mockResolvedValue({
      folders: [project(1, "Sales"), { ...project(2, "Legal Reviewer"), inRoom: false }],
    });
    const store = new AiPresetsStore();
    store.init("admin");
    await flush();
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);
  });

  it("keeps the last list when a re-read fails", async () => {
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();
    api.getAiProjects.mockRejectedValueOnce(new Error("offline"));
    await store.fetchPresets();
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);
  });

  it("creates a project from the chat's setup with its DocSpace rooms", async () => {
    api.createAiProject.mockResolvedValue(project(5, "Contracts"));
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    store.openSaveDialog(settings);
    const saved = await store.savePreset("  Contracts ");

    expect(api.createAiProject).toHaveBeenCalledWith({
      title: "Contracts",
      aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [9] },
    });
    expect(saved?.preset.id).toBe("5");
    expect(store.pendingSettings).toBeNull();
    expect(store.presets.map((p) => p.name)).toEqual(["Contracts", "Sales"]);
  });

  it("refuses an empty name and a save without an open dialog", async () => {
    const store = new AiPresetsStore();
    store.init("u1");
    expect(await store.savePreset("Name")).toBeNull();
    store.openSaveDialog(settings);
    expect(await store.savePreset("   ")).toBeNull();
    expect(api.createAiProject).not.toHaveBeenCalled();
  });

  it("keeps the dialog open when the create is refused", async () => {
    api.createAiProject.mockRejectedValue(new Error("403"));
    const store = new AiPresetsStore();
    store.init("u1");
    store.openSaveDialog(settings);
    await expect(store.savePreset("Contracts")).rejects.toThrow("403");
    expect(store.pendingSettings).toEqual(settings);
  });

  it("refreshes a list only once it is no longer current, and shares a read on its way", async () => {
    try {
      const store = new AiPresetsStore();
      store.init("u1");
      await flush();
      expect(api.getAiProjects).toHaveBeenCalledTimes(1);

      // Read a moment ago: the chat and its menu opening read nothing.
      await store.refreshPresets();
      expect(api.getAiProjects).toHaveBeenCalledTimes(1);

      vi.setSystemTime(Date.now() + PRESETS_FRESH_MS);
      await Promise.all([store.refreshPresets(), store.refreshPresets()]);
      expect(api.getAiProjects).toHaveBeenCalledTimes(2);

      // A list known to have changed is read whatever its age.
      await store.fetchPresets();
      expect(api.getAiProjects).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reads again after a failed read, however recent", async () => {
    api.getAiProjects.mockRejectedValueOnce(new Error("offline"));
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    await store.refreshPresets();
    expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);
  });

  it("applies a picked project as it is now", async () => {
    api.getAiProject.mockResolvedValue(project(1, "Sales (renamed)"));
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    expect(await store.requestApply(store.presets[0])).toBe("applied");
    expect(api.getAiProject).toHaveBeenCalledWith(1);
    expect(store.pendingApply?.name).toBe("Sales (renamed)");
    expect(store.presets[0].name).toBe("Sales (renamed)");
    expect(store.consumePendingApply()?.name).toBe("Sales (renamed)");
    expect(store.pendingApply).toBeNull();
  });

  it("drops a picked project that is gone instead of applying it", async () => {
    api.getAiProject.mockRejectedValue({ response: { status: 404 } });
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    expect(await store.requestApply(store.presets[0])).toBe("gone");
    expect(store.pendingApply).toBeNull();
    expect(store.presets).toEqual([]);
  });

  it("applies nothing and rejects with the error when the project cannot be read for another reason", async () => {
    const failure = { response: { status: 500 }, message: "down" };
    api.getAiProject.mockRejectedValue(failure);
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    await expect(store.requestApply(store.presets[0])).rejects.toBe(failure);
    expect(store.pendingApply).toBeNull();
    // The project stays in the list.
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);
  });

  it("drops a failed read quietly once another pick overtook it", async () => {
    let failSales: (reason: unknown) => void = () => {};
    api.getAiProject.mockImplementationOnce(
      () =>
        new Promise<TAiProject>((_, reject) => {
          failSales = reject;
        }),
    );
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    const sales = store.requestApply(store.presets[0]);
    store.cancelApply();
    failSales({ response: { status: 500 } });
    expect(await sales).toBe("superseded");
  });

  it("applies only the latest pick, whichever read comes back first", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    let resolveSales: (value: TAiProject) => void = () => {};
    api.getAiProject.mockImplementation((id: number) =>
      id === 1
        ? new Promise<TAiProject>((resolve) => {
            resolveSales = resolve;
          })
        : Promise.resolve(project(2, "Legal")),
    );
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    const sales = store.requestApply(store.presets[0]);
    expect(await store.requestApply(store.presets[1])).toBe("applied");
    expect(store.pendingApply?.id).toBe("2");

    resolveSales(project(1, "Sales"));
    expect(await sales).toBe("superseded");
    expect(store.pendingApply?.id).toBe("2");
  });

  it("drops a pick called off while its read is on its way", async () => {
    let resolveSales: (value: TAiProject) => void = () => {};
    api.getAiProject.mockImplementation(
      () =>
        new Promise<TAiProject>((resolve) => {
          resolveSales = resolve;
        }),
    );
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    const sales = store.requestApply(store.presets[0]);
    store.cancelApply();
    resolveSales(project(1, "Sales"));
    expect(await sales).toBe("superseded");
    expect(store.pendingApply).toBeNull();
  });

  it("exposes the active project's Instructions rooms as the chat context rooms", () => {
    const store = new AiPresetsStore();
    store.setActivePreset(toAiPreset(project(1, "Sales")));
    expect(store.activePresetContextRooms).toEqual([
      { id: "12", name: "Skills" },
      { id: "13", name: "Legal tone" },
    ]);
    store.setActivePreset(null);
    expect(store.activePresetContextRooms).toBeNull();
  });
});
