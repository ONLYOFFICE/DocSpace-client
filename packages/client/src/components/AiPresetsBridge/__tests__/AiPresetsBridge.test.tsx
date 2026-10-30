import React from "react";
import { Provider } from "mobx-react";
import { makeAutoObservable } from "mobx";
import { MemoryRouter } from "react-router";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
}));

const { toastr } = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));

/** The slice of the panel store the bridge drives, observable so its reactions fire. */
class FakeAiChatStore {
  isVisible = false;

  onSavePreset: unknown = null;

  projectTitle: string | null = null;

  knowledgePickerHidden = false;

  applyPreset = vi.fn();

  constructor() {
    makeAutoObservable(this, { applyPreset: false });
  }

  setIsVisible = (visible: boolean) => {
    this.isVisible = visible;
  };

  setOnSavePreset = (hook: unknown) => {
    this.onSavePreset = hook;
  };

  setKnowledgePickerHidden = (value: boolean) => {
    this.knowledgePickerHidden = value;
  };

  setProjectTitle = (title: string | null) => {
    this.projectTitle = title;
  };

}

let aiChatStore = new FakeAiChatStore();

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStore: () => aiChatStore,
}));

vi.mock("SRC_DIR/components/GlobalEvents/sub-components/Dialog", () => ({
  default: ({
    title,
    startValue,
    onSave,
    onCancel,
  }: {
    title: string;
    startValue: string;
    onSave: (e: unknown, value: string) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="save-dialog" data-title={title}>
      <button type="button" data-testid="save" onClick={() => onSave(null, `${startValue} 2`)}>
        save
      </button>
      <button type="button" data-testid="cancel" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

import AiPresetsStore, { toAiPreset } from "SRC_DIR/store/AiPresetsStore";

import AiPresetsBridgeConnected from "../index";

// `inject` supplies the store props; the test renders it under a Provider.
const AiPresetsBridge = AiPresetsBridgeConnected as unknown as React.FC;

const project = (id: number, title: string, warnings?: { code: "grantSkipped"; message: string }[]) =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
    aiProject: {
      profile: { id: "p1", name: "Claude", available: true },
      instructionsRooms: [{ id: 12, title: "Skills", available: true }],
      knowledgeRooms: [{ id: 9, title: "Docs", available: true }],
      canEditSettings: true,
      ...(warnings ? { warnings } : {}),
    },
  }) as unknown as TAiProject;

const settings = {
  profileId: "p1",
  profileName: "Claude",
  contextRooms: [{ cloud: "docspace", id: "12", name: "Skills" }],
  knowledgeRooms: [],
};

const renderBridge = (
  aiPresetsStore: AiPresetsStore,
  {
    path = "/rooms/shared",
    user = { id: "u1", isAdmin: true } as object | null,
    aiConfig = null as { vectorizationEnabled: boolean } | null,
  } = {},
) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Provider aiPresetsStore={aiPresetsStore} userStore={{ user }} settingsStore={{ aiConfig }}>
        <AiPresetsBridge />
      </Provider>
    </MemoryRouter>,
  );

const flush = () => act(async () => {});

describe("AiPresetsBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiChatStore = new FakeAiChatStore();
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales")] });
  });

  it("loads the signed-in user's projects once; opening the chat reads nothing more", async () => {
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(1);
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);

    // The model picker refreshes the list itself when it opens
    // (onProfilePickerOpen in Shell), so the chat's opening costs no read.
    act(() => aiChatStore.setIsVisible(true));
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(1);
  });

  it("offers the save button to those who may create projects, outside a project", () => {
    const store = new AiPresetsStore();
    const { unmount } = renderBridge(store);
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
    unmount();
    expect(aiChatStore.onSavePreset).toBeNull();

    renderBridge(store, { user: { id: "u1", isAdmin: false } });
    expect(aiChatStore.onSavePreset).toBeNull();
  });

  it("hides the save button and titles the chat inside a project", () => {
    const store = new AiPresetsStore();
    renderBridge(store, { path: "/ai-projects/1" });
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
    act(() => store.setActivePreset(toAiPreset(project(1, "Sales"))));
    expect(aiChatStore.onSavePreset).toBeNull();
    expect(aiChatStore.projectTitle).toBe("Sales");

    act(() => store.setActivePreset(null));
    expect(aiChatStore.projectTitle).toBeNull();
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
  });

  it("creates a project from the chat's setup through the naming dialog", async () => {
    api.createAiProject.mockResolvedValue(
      project(5, "Common:AIProjectDefaultName 2", [{ code: "grantSkipped", message: "Viewer skipped" }]),
    );
    const store = new AiPresetsStore();
    renderBridge(store);
    expect(screen.queryByTestId("save-dialog")).toBeNull();

    act(() => store.openSaveDialog(settings));
    expect(screen.getByTestId("save-dialog")).toHaveAttribute("data-title", "Common:SaveAIProject");
    fireEvent.click(screen.getByTestId("save"));
    await flush();

    expect(api.createAiProject).toHaveBeenCalledWith({
      title: "Common:AIProjectDefaultName 2",
      aiProject: { profileId: "p1", instructionsRoomIds: [12], knowledgeRoomIds: [] },
    });
    expect(toastr.success).toHaveBeenCalledWith("Common:AIProjectSaved");
    expect(toastr.warning).toHaveBeenCalledWith("Viewer skipped");
    expect(screen.queryByTestId("save-dialog")).toBeNull();
  });

  it("reports a refused create and keeps the dialog, and closes it on cancel", async () => {
    api.createAiProject.mockRejectedValue({ response: { data: { error: "No rights" } } });
    const store = new AiPresetsStore();
    renderBridge(store);
    act(() => store.openSaveDialog(settings));
    fireEvent.click(screen.getByTestId("save"));
    await flush();
    expect(toastr.error).toHaveBeenCalledWith("No rights");
    expect(screen.getByTestId("save-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("cancel"));
    expect(screen.queryByTestId("save-dialog")).toBeNull();
  });

  it("applies a project picked in the model menu and drops it when the chat closes", async () => {
    api.getAiProject.mockResolvedValue(project(1, "Sales"));
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    act(() => aiChatStore.setIsVisible(true));

    await act(async () => {
      await store.requestApply(store.presets[0]);
    });
    expect(store.pendingApply).toBeNull();
    expect(store.activePreset?.name).toBe("Sales");
    expect(aiChatStore.projectTitle).toBe("Sales");
    expect(aiChatStore.applyPreset).toHaveBeenCalledWith({
      profileId: "p1",
      profileName: "Claude",
      contextRooms: [{ cloud: "docspace", id: "12", name: "Skills" }],
      knowledgeRooms: [{ cloud: "docspace", id: "9", name: "Docs" }],
    });

    act(() => aiChatStore.setIsVisible(false));
    expect(store.activePreset).toBeNull();
    expect(aiChatStore.projectTitle).toBeNull();
    // The model and every room of the project go too.
    expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith({
      profileId: null,
      profileName: null,
      contextRooms: [],
      knowledgeRooms: [],
    });
  });

  it("hides the composer's knowledge base picker while vectorization is off", async () => {
    const store = new AiPresetsStore();
    const { unmount } = renderBridge(store, { aiConfig: { vectorizationEnabled: false } });
    await flush();
    expect(aiChatStore.knowledgePickerHidden).toBe(true);
    unmount();
    expect(aiChatStore.knowledgePickerHidden).toBe(false);
  });

  it("keeps the knowledge base picker while vectorization is on or unknown", async () => {
    const store = new AiPresetsStore();
    renderBridge(store, { aiConfig: { vectorizationEnabled: true } });
    await flush();
    expect(aiChatStore.knowledgePickerHidden).toBe(false);
  });

  it("leaves a chat no project was applied to as it is when it closes", async () => {
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();

    act(() => aiChatStore.setIsVisible(true));
    act(() => aiChatStore.setIsVisible(false));
    expect(aiChatStore.applyPreset).not.toHaveBeenCalled();
  });
});
