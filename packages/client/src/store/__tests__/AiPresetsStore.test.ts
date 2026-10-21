import { describe, it, expect, beforeEach } from "vitest";

import AiPresetsStore from "../AiPresetsStore";

const settings = {
  profileId: "p1",
  profileName: "Claude",
  contextRoom: { cloud: "docspace", id: "12", name: "Skills" },
  knowledgeRoom: null,
};

describe("AiPresetsStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves a room changed in the project view into the project", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    store.openSaveDialog({
      profileId: "p1",
      profileName: "Claude",
      contextRoom: null,
      knowledgeRoom: null,
    });
    const preset = store.savePreset("Contracts");
    expect(preset).not.toBeNull();
    if (!preset) return;

    store.updateActiveProject({ contextRoom: null });
    expect(store.presets[0].knowledgeRoom).toBeNull();

    store.setActivePreset(preset);
    const knowledgeRoom = { cloud: "docspace", id: "9", name: "Docs" };
    store.updateActiveProject({ knowledgeRoom });
    expect(store.activePreset?.knowledgeRoom).toEqual(knowledgeRoom);
    expect(store.presets[0].knowledgeRoom).toEqual(knowledgeRoom);

    const again = new AiPresetsStore();
    again.init("u1");
    expect(again.presets[0].knowledgeRoom).toEqual(knowledgeRoom);
  });

  it("records a picker apply request until the bridge consumes it", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    expect(store.pendingApply).toBeNull();
    store.openSaveDialog({
      profileId: "p1",
      profileName: "Claude",
      contextRoom: null,
      knowledgeRoom: null,
    });
    const preset = store.savePreset("Daily");
    expect(preset).not.toBeNull();
    if (!preset) return;
    store.requestApply(preset);
    expect(store.pendingApply).toBe(preset);
    expect(store.consumePendingApply()).toBe(preset);
    expect(store.pendingApply).toBeNull();
    expect(store.consumePendingApply()).toBeNull();
  });

  it("starts empty and keeps the save dialog closed", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    expect(store.presets).toEqual([]);
    expect(store.pendingSettings).toBeNull();
  });

  it("saves a named preset from the dialog settings and persists it per user", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    store.openSaveDialog(settings);
    const preset = store.savePreset("  Sales helper ");

    expect(preset?.name).toBe("Sales helper");
    expect(store.pendingSettings).toBeNull();
    expect(store.presets).toHaveLength(1);

    const again = new AiPresetsStore();
    again.init("u1");
    expect(again.presets.map((p) => p.name)).toEqual(["Sales helper"]);

    const other = new AiPresetsStore();
    other.init("u2");
    expect(other.presets).toEqual([]);
  });

  it("refuses an empty name and a save without an open dialog", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    expect(store.savePreset("Name")).toBeNull();
    store.openSaveDialog(settings);
    expect(store.savePreset("   ")).toBeNull();
    expect(store.presets).toEqual([]);
  });

  it("drops malformed entries found in storage", () => {
    localStorage.setItem(
      "docspace_ai_presets_u1",
      JSON.stringify([{ id: 1 }, { ...settings, id: "a", name: "Ok" }]),
    );
    const store = new AiPresetsStore();
    store.init("u1");
    expect(store.presets.map((p) => p.name)).toEqual(["Ok"]);
  });

  it("exposes the active preset's skills room as the chat context room", () => {
    const store = new AiPresetsStore();
    store.init("u1");
    store.openSaveDialog(settings);
    const preset = store.savePreset("Sales");
    store.setActivePreset(preset);
    expect(store.activePresetContextRoom).toEqual({ id: "12", name: "Skills" });
    store.setActivePreset(null);
    expect(store.activePresetContextRoom).toBeNull();
  });
});
