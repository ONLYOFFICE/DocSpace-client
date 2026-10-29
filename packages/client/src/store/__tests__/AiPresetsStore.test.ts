import { describe, it, expect, beforeEach, vi } from "vitest";

import type { TAiProject, TAiProjectSource } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);

import AiPresetsStore, { toAiPreset } from "../AiPresetsStore";

const room = (id: number, title: string, available = true): TAiProjectSource =>
  ({ id, title, available, roomType: 10 }) as TAiProjectSource;

const project = (id: number, title: string, overrides: Partial<TAiProject["aiProject"]> = {}) =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
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

  it("applies a picked project as it is now", async () => {
    api.getAiProject.mockResolvedValue(project(1, "Sales (renamed)"));
    const store = new AiPresetsStore();
    store.init("u1");
    await flush();

    expect(await store.requestApply(store.presets[0])).toBe(true);
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

    expect(await store.requestApply(store.presets[0])).toBe(false);
    expect(store.pendingApply).toBeNull();
    expect(store.presets).toEqual([]);
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
