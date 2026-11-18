import React from "react";
import { Provider } from "mobx-react";
import { makeAutoObservable } from "mobx";
import { MemoryRouter } from "react-router";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

const api = vi.hoisted(() => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
  deleteAiProject: vi.fn(),
  aiProjectToRoom: (p: object) => ({ ...p, isRoom: true }),
}));

const { toastr } = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);


// The Info panel as a page that has one shows it: `showInfoPanel` makes it
// visible only while `mounted`. Observable, as the store's flag is.
const infoPanel = await vi.hoisted(async () => {
  const { observable, runInAction } = await import("mobx");
  const state = observable({ mounted: true, isVisible: false });
  return {
    state,
    hide: () => runInAction(() => (state.isVisible = false)),
    showInfoPanel: vi.fn(() => {
      if (state.mounted) runInAction(() => (state.isVisible = true));
    }),
    InfoPanelView: { infoDetails: "info_details" },
  };
});
vi.mock("SRC_DIR/helpers/info-panel", () => infoPanel);

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("react-router", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useNavigate: () => mockNavigate,
}));

const setBufferSelection = vi.fn();
const setSelection = vi.fn();
const setInfoPanelView = vi.fn();

vi.mock("../DeleteAgentDialog", () => ({
  default: ({ agentName, onDelete, onClose }: { agentName: string; onDelete: () => void; onClose: () => void }) => (
    <div data-testid="delete-agent-dialog" data-name={agentName}>
      <button type="button" data-testid="delete-agent-confirm" onClick={onDelete} />
      <button type="button" data-testid="delete-agent-cancel" onClick={onClose} />
    </div>
  ),
}));

const openEditAiProject = vi.fn();
const changeSkillRooms = vi.fn();
const inviteToRoom = vi.fn();
const requestAiChatPage = vi.fn();
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));

/** The slice of the panel store the bridge drives, observable so its reactions fire. */
class FakeAiChatStore {
  isVisible = false;

  onSavePreset: unknown = null;

  projectTitle: string | null = null;

  knowledgePickerHidden = false;

  agentPicker: {
    agents: { id: string; name: string }[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onOpen?: () => void;
  } | null = null;

  agentActions: { id: string; label: string; isDanger?: boolean; onClick: () => void }[] | null = null;

  sourcesManager: {
    onManage: (() => void) | null;
    onSkillRoomsChange?: (change: { added: { id: string; name: string }[]; removed: string[] }) => void;
  } | null = null;

  applyPreset = vi.fn();

  constructor() {
    makeAutoObservable(this, {
      applyPreset: false,
      agentPicker: false,
      agentActions: false,
      sourcesManager: false,
      chatAgent: false,
    });
  }

  setSourcesManager = (manager: FakeAiChatStore["sourcesManager"]) => {
    this.sourcesManager = manager;
  };

  setAgentActions = (actions: FakeAiChatStore["agentActions"]) => {
    this.agentActions = actions;
  };

  setAgentPicker = (picker: FakeAiChatStore["agentPicker"]) => {
    this.agentPicker = picker;
  };

  chatAgent: { name: string; logo?: unknown } | null = null;

  setChatAgent = (agent: FakeAiChatStore["chatAgent"]) => {
    this.chatAgent = agent;
  };

  setIsVisible = (visible: boolean) => {
    this.isVisible = visible;
  };

  open = () => {
    this.isVisible = true;
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

// The project logos the agents menu draws.
vi.mock("SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo", () => ({
  ProjectLogo: () => <span data-testid="project-logo" />,
}));

// The bridge reads whether a profile that can chat exists to tell "AI is
// set up", and whether the portal has a chat model for an agent without one.
const profiles = vi.hoisted(() => ({
  state: {
    initialized: true,
    hasProfiles: true,
    hasChatProfiles: true,
    chatProfile: null as { capabilities?: number } | null,
    defaultProfile: { capabilities: 1 } as { capabilities?: number } | null,
  },
}));
// The chat's conversation: an id once it has messages, "" while it has none.
const threads = vi.hoisted(() => {
  const state = {
    threadId: "",
    onSwitchToNewThread: vi.fn((_opts?: { keepSessionProfile?: boolean }) => {
      state.threadId = "";
    }),
  };
  return state;
});
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers", () => ({
  useStores: () => ({
    useProfilesStore: (select: (s: typeof profiles.state) => unknown) => select(profiles.state),
    useThreadsStore: { getState: () => threads },
  }),
}));
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

import AiPresetsStore, { PRESETS_FRESH_MS, toAiPreset } from "SRC_DIR/store/AiPresetsStore";

import AiPresetsBridgeConnected from "../index";

const setAiReady = vi.fn();
const setPortalHasChatModel = vi.fn();

// `inject` supplies the store props; the test renders it under a Provider.
const AiPresetsBridge = AiPresetsBridgeConnected as unknown as React.FC<{ enabled: boolean }>;

const project = (id: number, title: string, warnings?: { code: "roomUnavailable"; message: string }[]) =>
  ({
    id,
    title,
    created: "2026-10-01T00:00:00.000Z",
    inRoom: true,
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
    enabled = true,
    activeProject = null as object | null,
  } = {},
) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Provider
        aiPresetsStore={aiPresetsStore}
        aiProjectsStore={{
          activeProject,
          openEditDialogById: openEditAiProject,
          changeSkillRooms,
          setPortalHasChatModel,
        }}
        contextOptionsStore={{ onClickInviteUsers: inviteToRoom }}
        dialogsStore={{ requestAiChatPage }}
        filesStore={{ setSelection, setBufferSelection }}
        infoPanelStore={Object.assign(infoPanel.state, { setView: setInfoPanelView })}
        userStore={{ user }}
        settingsStore={{ aiConfig, standalone: true, setAiReady }}
        paymentStore={{ isAIReady: false }}
      >
        <AiPresetsBridge enabled={enabled} />
      </Provider>
    </MemoryRouter>,
  );

const flush = () => act(async () => {});

// Past the moment a read list counts as current, so the chat's own
// re-reads read again.
const later = () => vi.setSystemTime(Date.now() + PRESETS_FRESH_MS);

describe("AiPresetsBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiChatStore = new FakeAiChatStore();
    threads.threadId = "";
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales")] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads the signed-in user's projects, and reads them again whenever the chat opens", async () => {
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(1);
    expect(store.presets.map((p) => p.name)).toEqual(["Sales"]);

    // Right after the first read the list is current: nothing is read.
    act(() => aiChatStore.setIsVisible(true));
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(1);
    act(() => aiChatStore.setIsVisible(false));

    // Later, a project created or shared elsewhere meanwhile reaches the
    // agents menu, even for a user who had none (and so had no menu to open).
    later();
    act(() => aiChatStore.setIsVisible(true));
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(2);
    act(() => aiChatStore.setIsVisible(false));
    await flush();
    expect(api.getAiProjects).toHaveBeenCalledTimes(2);

    // The agents menu opened right after the chat reads nothing more.
    later();
    act(() => aiChatStore.setIsVisible(true));
    await flush();
    await act(async () => aiChatStore.agentPicker?.onOpen?.());
    expect(api.getAiProjects).toHaveBeenCalledTimes(3);
  });

  it("reads no projects while AI requests are off (unpaid portal, AI services off)", async () => {
    const store = new AiPresetsStore();
    renderBridge(store, { enabled: false });
    await flush();
    expect(api.getAiProjects).not.toHaveBeenCalled();
    expect(store.presets).toEqual([]);
  });

  it("offers Save as new agent to those who may create projects, outside a project", () => {
    const store = new AiPresetsStore();
    const { unmount } = renderBridge(store);
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
    unmount();
    expect(aiChatStore.onSavePreset).toBeNull();

    renderBridge(store, { user: { id: "u1", isAdmin: false } });
    expect(aiChatStore.onSavePreset).toBeNull();
  });

  it("offers no Save as new agent inside a project and keeps the chat title", () => {
    const store = new AiPresetsStore();
    renderBridge(store, { path: "/ai-rooms/1/filter" });
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
    act(() => store.setActivePreset(toAiPreset(project(1, "Sales"))));
    expect(aiChatStore.onSavePreset).toBeNull();
    // The panel is titled "AI Chat" whatever project the chat runs in.
    expect(aiChatStore.projectTitle).toBeNull();

    act(() => store.setActivePreset(null));
    expect(aiChatStore.onSavePreset).toBe(store.openSaveDialog);
  });

  it("creates a project from the chat's setup through the naming dialog", async () => {
    api.createAiProject.mockResolvedValue(
      project(5, "Common:NewAgent 2", [{ code: "roomUnavailable", message: "Viewer skipped" }]),
    );
    const store = new AiPresetsStore();
    renderBridge(store);
    expect(screen.queryByTestId("save-dialog")).toBeNull();

    act(() => store.openSaveDialog(settings));
    expect(screen.getByTestId("save-dialog")).toHaveAttribute("data-title", "Common:SaveAsNewAgent");
    fireEvent.click(screen.getByTestId("save"));
    await flush();

    expect(api.createAiProject).toHaveBeenCalledWith({
      title: "Common:NewAgent 2",
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

  it("tells the chat which agent it runs on, and that the default agent is none", () => {
    const store = new AiPresetsStore();
    renderBridge(store);
    expect(aiChatStore.chatAgent).toBeNull();

    act(() => store.setActivePreset(toAiPreset(project(1, "Sales"))));
    expect(aiChatStore.chatAgent?.name).toBe("Sales");
    expect(aiChatStore.chatAgent?.logo).toBeTruthy();

    act(() => store.setActivePreset(null));
    expect(aiChatStore.chatAgent).toBeNull();
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
    expect(aiChatStore.projectTitle).toBeNull();
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
  it("tells the stores that AI is set up once a chat profile exists on standalone", () => {
    setAiReady.mockClear();
    renderBridge(new AiPresetsStore());
    expect(setAiReady).toHaveBeenLastCalledWith(true);
  });

  it("does not take a portal whose profiles cannot chat for AI set up on standalone", () => {
    profiles.state = { ...profiles.state, hasProfiles: true, hasChatProfiles: false };
    try {
      renderBridge(new AiPresetsStore());
      expect(setAiReady).toHaveBeenLastCalledWith(false);
    } finally {
      profiles.state = { ...profiles.state, hasChatProfiles: true };
    }
  });

  it("tells the stores whether the portal has a chat model for an agent without its own", () => {
    const initial = profiles.state;
    try {
      renderBridge(new AiPresetsStore());
      expect(setPortalHasChatModel).toHaveBeenLastCalledWith(true);

      cleanup();
      // The Default slot holds an image model only, and no Chat model is assigned.
      profiles.state = { ...initial, chatProfile: null, defaultProfile: { capabilities: 2 } };
      renderBridge(new AiPresetsStore());
      expect(setPortalHasChatModel).toHaveBeenLastCalledWith(false);

      cleanup();
      profiles.state = { ...initial, initialized: false };
      renderBridge(new AiPresetsStore());
      expect(setPortalHasChatModel).toHaveBeenLastCalledWith(null);
    } finally {
      profiles.state = initial;
    }
  });
  it("offers the projects as the panel title's agents, an empty menu while there are none", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [] });
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    // The panel still opens it for a user who may save the chat as a new
    // agent, and shows a plain title to anyone else.
    expect(aiChatStore.agentPicker?.agents).toEqual([]);

    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    await act(() => store.fetchPresets());
    expect(aiChatStore.agentPicker?.agents.map((a) => a.name)).toEqual(["Sales", "Legal"]);
    expect(aiChatStore.agentPicker?.selectedId).toBeNull();

    // Opening the menu reads the projects again, once they are not current.
    later();
    await act(async () => aiChatStore.agentPicker?.onOpen?.());
    expect(api.getAiProjects).toHaveBeenCalledTimes(3);
  });

  it("applies an agent picked in the title and goes back to the default agent", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    api.getAiProject.mockResolvedValue(project(2, "Legal"));
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    act(() => aiChatStore.setIsVisible(true));
    await flush();

    await act(async () => aiChatStore.agentPicker?.onSelect("2"));
    await flush();
    expect(store.activePreset?.id).toBe("2");
    expect(aiChatStore.agentPicker?.selectedId).toBe("2");
    expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith(
      expect.objectContaining({ profileId: "p1", contextRooms: [{ cloud: "docspace", id: "12", name: "Skills" }] }),
    );

    act(() => aiChatStore.agentPicker?.onSelect(null));
    expect(store.activePreset).toBeNull();
    expect(aiChatStore.agentPicker?.selectedId).toBeNull();
    expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith({
      profileId: null,
      profileName: null,
      contextRooms: [],
      knowledgeRooms: [],
    });
  });

  it("starts a new conversation on a picked agent when the chat has messages, and on the default agent again", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    api.getAiProject.mockImplementation(async (id: number) => project(id, id === 1 ? "Sales" : "Legal"));
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    act(() => aiChatStore.setIsVisible(true));

    // An empty chat goes on, on the picked agent.
    await act(async () => aiChatStore.agentPicker?.onSelect("1"));
    await flush();
    expect(store.activePreset?.id).toBe("1");
    expect(threads.onSwitchToNewThread).not.toHaveBeenCalled();

    // A chat with messages stays with its agent: the next one is new.
    threads.threadId = "t1";
    await act(async () => aiChatStore.agentPicker?.onSelect("2"));
    await flush();
    expect(store.activePreset?.id).toBe("2");
    expect(threads.onSwitchToNewThread).toHaveBeenCalledTimes(1);
    expect(threads.onSwitchToNewThread).toHaveBeenLastCalledWith({ keepSessionProfile: true });
    // The new conversation runs on the picked agent's model and rooms.
    expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith(expect.objectContaining({ profileId: "p1" }));

    threads.threadId = "t2";
    act(() => aiChatStore.agentPicker?.onSelect(null));
    expect(threads.onSwitchToNewThread).toHaveBeenCalledTimes(2);
    expect(store.activePreset).toBeNull();
  });

  it("leaves the conversation with its agent when the panel closes on it", async () => {
    api.getAiProject.mockResolvedValue(project(1, "Sales"));
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    act(() => aiChatStore.setIsVisible(true));
    await act(async () => aiChatStore.agentPicker?.onSelect("1"));
    await flush();

    threads.threadId = "t1";
    act(() => aiChatStore.setIsVisible(false));
    expect(threads.onSwitchToNewThread).toHaveBeenCalledTimes(1);
    expect(store.activePreset).toBeNull();
  });

  it("reports an agent that is gone by the time it is picked", async () => {
    api.getAiProject.mockRejectedValue({ response: { status: 404 } });
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();

    await act(async () => aiChatStore.agentPicker?.onSelect("1"));
    await flush();
    expect(toastr.info).toHaveBeenCalledWith("Common:AIProjectNotAvailable");
    expect(store.activePreset).toBeNull();
    // The last project left the list: the menu has no agent left.
    expect(aiChatStore.agentPicker?.agents).toEqual([]);
  });

  it("reports an agent that cannot be read and leaves the chat as it is", async () => {
    api.getAiProject.mockRejectedValue({ response: { status: 500, data: { error: "down" } } });
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();

    await act(async () => aiChatStore.agentPicker?.onSelect("1"));
    await flush();
    expect(toastr.error).toHaveBeenCalledWith("down");
    expect(store.activePreset).toBeNull();
    expect(aiChatStore.applyPreset).not.toHaveBeenCalled();
  });

  it("keeps the project the chat runs on in the menu once the list has lost it", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    api.getAiProject.mockResolvedValue(project(1, "Sales"));
    const store = new AiPresetsStore();
    renderBridge(store);
    await flush();
    act(() => aiChatStore.setIsVisible(true));
    await flush();
    await act(async () => aiChatStore.agentPicker?.onSelect("1"));
    await flush();
    expect(store.activePreset?.id).toBe("1");

    // Deleted or left elsewhere: the menu's next read no longer has it.
    api.getAiProjects.mockResolvedValue({ folders: [project(2, "Legal")] });
    later();
    await act(async () => aiChatStore.agentPicker?.onOpen?.());
    expect(aiChatStore.agentPicker?.agents.map((a) => a.id)).toEqual(["1", "2"]);
    expect(aiChatStore.agentPicker?.selectedId).toBe("1");

    // The last project gone as well: the menu stays, to take the chat off it.
    api.getAiProjects.mockResolvedValue({ folders: [] });
    later();
    await act(async () => aiChatStore.agentPicker?.onOpen?.());
    expect(aiChatStore.agentPicker?.agents.map((a) => a.id)).toEqual(["1"]);

    act(() => aiChatStore.agentPicker?.onSelect(null));
    expect(store.activePreset).toBeNull();
    expect(aiChatStore.agentPicker?.agents).toEqual([]);
  });

  describe("the actions of the picked agent", () => {
    const withRights = (security: object, canEditSettings: boolean) => ({
      ...project(1, "Sales"),
      security,
      aiProject: { ...project(1, "Sales").aiProject, canEditSettings },
    });
    const pick = async (store: AiPresetsStore, picked: object) => {
      api.getAiProject.mockResolvedValue(picked);
      renderBridge(store);
      await flush();
      act(() => aiChatStore.setIsVisible(true));
      await act(async () => aiChatStore.agentPicker?.onSelect("1"));
      await flush();
    };
    const action = (id: string) => aiChatStore.agentActions?.find((a) => a.id === id);

    it("are none on the default agent", async () => {
      renderBridge(new AiPresetsStore());
      await flush();
      expect(aiChatStore.agentActions).toBeNull();
    });

    it("follow the owner's rights and open the agent's form, invite panel and page", async () => {
      await pick(new AiPresetsStore(), withRights({ EditAccess: true, Delete: true }, true));
      expect(aiChatStore.agentActions?.map((a) => a.id)).toEqual(["edit", "share", "info", "delete"]);
      expect(action("delete")?.isDanger).toBe(true);

      act(() => action("edit")?.onClick());
      expect(openEditAiProject).toHaveBeenCalledWith(1);
      act(() => action("share")?.onClick());
      expect(inviteToRoom).toHaveBeenCalledWith(1, expect.anything());
    });

    it("open the Info panel on the agent where the user is, without leaving the page", async () => {
      infoPanel.state.mounted = true;
      infoPanel.hide();
      const picked = withRights({ EditAccess: true, Delete: true }, true);
      await pick(new AiPresetsStore(), picked);

      await act(async () => action("info")?.onClick());
      expect(setSelection).toHaveBeenCalledWith([]);
      expect(setBufferSelection).toHaveBeenCalledWith(expect.objectContaining({ id: 1, isRoom: true }));
      expect(setInfoPanelView).toHaveBeenCalledWith("info_details");
      expect(infoPanel.showInfoPanel).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("bring the chat back on its agent when the Info panel of Agent info closes", async () => {
      infoPanel.state.mounted = true;
      infoPanel.hide();
      const store = new AiPresetsStore();
      await pick(store, withRights({ EditAccess: true, Delete: true }, true));
      aiChatStore.applyPreset.mockClear();

      await act(async () => action("info")?.onClick());
      // The Info panel takes the chat's place, as the page does it.
      act(() => aiChatStore.setIsVisible(false));
      // Not the user's close: the chat stays on its agent.
      expect(store.activePreset?.id).toBe("1");
      expect(aiChatStore.applyPreset).not.toHaveBeenCalled();

      act(() => infoPanel.hide());
      expect(aiChatStore.isVisible).toBe(true);
      expect(store.activePreset?.id).toBe("1");
      // The list gets its selection back.
      expect(setBufferSelection).toHaveBeenLastCalledWith(null);

      // A close by the user after that drops the agent, as always.
      act(() => aiChatStore.setIsVisible(false));
      expect(store.activePreset).toBeNull();
    });

    it("go to the agent's page for Agent info where the page has no Info panel", async () => {
      infoPanel.state.mounted = false;
      infoPanel.hide();
      await pick(new AiPresetsStore(), withRights({}, false));

      await act(async () => action("info")?.onClick());
      expect(mockNavigate).toHaveBeenCalledWith("/ai-rooms/1/filter?folder=1");
      expect(infoPanel.showInfoPanel).toHaveBeenCalledTimes(2);
    });

    it("leave a member with Agent info alone", async () => {
      await pick(new AiPresetsStore(), withRights({ EditAccess: false, Delete: false }, false));
      expect(aiChatStore.agentActions?.map((a) => a.id)).toEqual(["info"]);
    });

    it("delete the agent after a confirmation and take the chat back to the default agent", async () => {
      const store = new AiPresetsStore();
      await pick(store, withRights({ EditAccess: true, Delete: true }, true));
      api.deleteAiProject.mockResolvedValue({});

      act(() => action("delete")?.onClick());
      expect(screen.getByTestId("delete-agent-dialog")).toHaveAttribute("data-name", "Sales");
      // Cancelled: nothing is deleted.
      fireEvent.click(screen.getByTestId("delete-agent-cancel"));
      expect(screen.queryByTestId("delete-agent-dialog")).toBeNull();
      expect(api.deleteAiProject).not.toHaveBeenCalled();

      act(() => action("delete")?.onClick());
      await act(async () => fireEvent.click(screen.getByTestId("delete-agent-confirm")));
      expect(api.deleteAiProject).toHaveBeenCalledWith(1);
      expect(store.activePreset).toBeNull();
      expect(store.presets.some((p) => p.id === "1")).toBe(false);
      expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith(
        expect.objectContaining({ profileId: null, contextRooms: [] }),
      );
      expect(aiChatStore.agentActions).toBeNull();
      expect(screen.queryByTestId("delete-agent-dialog")).toBeNull();
    });

    it("make the agent the owner of the chat's sources, managed by its form for an Agent manager", async () => {
      const store = new AiPresetsStore();
      await pick(store, withRights({ EditAccess: true }, true));
      const manager = aiChatStore.sourcesManager;
      expect(manager).not.toBeNull();

      act(() => manager?.onManage?.());
      expect(openEditAiProject).toHaveBeenCalledWith(1);

      // A Skill set changed in the slash menu is saved to the agent.
      changeSkillRooms.mockResolvedValue(true);
      aiChatStore.applyPreset.mockClear();
      await act(async () => manager?.onSkillRoomsChange?.({ added: [], removed: ["12"] }));
      expect(changeSkillRooms).toHaveBeenCalledWith(1, { added: [], removed: ["12"] });
      expect(aiChatStore.applyPreset).not.toHaveBeenCalled();

      // A refused save takes the chat back to the rooms the agent has.
      changeSkillRooms.mockResolvedValue(false);
      await act(async () => manager?.onSkillRoomsChange?.({ added: [], removed: ["12"] }));
      expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith(
        expect.objectContaining({ contextRooms: [{ cloud: "docspace", id: "12", name: "Skills" }] }),
      );

      // The default agent picked: the chat's sources are its own again.
      act(() => aiChatStore.agentPicker?.onSelect(null));
      expect(aiChatStore.sourcesManager).toBeNull();
    });

    it("bring an edit of the picked agent to the chat in place", async () => {
      const store = new AiPresetsStore();
      await pick(store, withRights({ EditAccess: true }, true));
      aiChatStore.applyPreset.mockClear();

      // The agent's form, opened from the panel, linked another knowledge base.
      const edited = withRights({ EditAccess: true }, true);
      edited.aiProject = {
        ...edited.aiProject,
        knowledgeRooms: [{ id: 15, title: "Policies", available: true }],
      } as typeof edited.aiProject;
      act(() => store.setActivePreset(toAiPreset(edited as unknown as TAiProject)));
      expect(aiChatStore.applyPreset).toHaveBeenCalledTimes(1);
      expect(aiChatStore.applyPreset).toHaveBeenLastCalledWith(
        expect.objectContaining({ knowledgeRooms: [{ cloud: "docspace", id: "15", name: "Policies" }] }),
      );
      // The conversation stays.
      expect(threads.onSwitchToNewThread).not.toHaveBeenCalled();

      // Read again with nothing changed: nothing is applied.
      act(() => store.setActivePreset(toAiPreset(edited as unknown as TAiProject)));
      expect(aiChatStore.applyPreset).toHaveBeenCalledTimes(1);
    });

    it("give a member the agent's sources with nothing to manage or remove", async () => {
      await pick(new AiPresetsStore(), withRights({ EditAccess: false }, false));
      expect(aiChatStore.sourcesManager).toEqual({ onManage: null, onSkillRoomsChange: undefined });
    });

    it("leave the sources and their edits to the agent's page while it is open", async () => {
      const store = new AiPresetsStore();
      renderBridge(store, { path: "/ai-rooms/1/filter", activeProject: { id: 1 } });
      await flush();
      act(() => store.setActivePreset(toAiPreset(project(1, "Sales"))));
      expect(aiChatStore.sourcesManager).toBeNull();
      const unlinked = { ...project(1, "Sales") };
      unlinked.aiProject = { ...unlinked.aiProject, knowledgeRooms: [] };
      act(() => store.setActivePreset(toAiPreset(unlinked)));
      expect(aiChatStore.applyPreset).not.toHaveBeenCalled();
    });

    it("keep the agent and the dialog when the delete is refused", async () => {
      const store = new AiPresetsStore();
      await pick(store, withRights({ EditAccess: true, Delete: true }, true));
      api.deleteAiProject.mockRejectedValue(new Error("refused"));

      act(() => action("delete")?.onClick());
      await act(async () => fireEvent.click(screen.getByTestId("delete-agent-confirm")));
      expect(toastr.error).toHaveBeenCalled();
      expect(store.activePreset?.id).toBe("1");
      expect(screen.getByTestId("delete-agent-dialog")).toBeInTheDocument();
    });
  });

  it("hands the agents to an open agent's page as its title menu: the open one picked, a pick opens that agent's page", async () => {
    api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
    const store = new AiPresetsStore();
    renderBridge(store, { path: "/ai-rooms/1/filter", activeProject: { id: 1 } });
    await flush();
    expect(aiChatStore.agentPicker?.agents.map((a) => a.name)).toEqual(["Sales", "Legal"]);
    expect(aiChatStore.agentPicker?.selectedId).toBe("1");

    act(() => aiChatStore.agentPicker?.onSelect("1"));
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => aiChatStore.agentPicker?.onSelect("2"));
    expect(mockNavigate).toHaveBeenCalledWith("/ai-rooms/2/filter?folder=2");
    // The chat is not put on another agent: the page is that agent.
    expect(store.activePreset).toBeNull();
  });

  it("opens AI Chat for the default agent picked on an agent's page", async () => {
    const store = new AiPresetsStore();
    renderBridge(store, { path: "/ai-rooms/1/filter", activeProject: { id: 1 } });
    await flush();
    act(() => aiChatStore.agentPicker?.onSelect(null));
    expect(requestAiChatPage).toHaveBeenCalledWith("chat", expect.any(String));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/ai-rooms\/filter\?/));
  });

  describe("a pick still being read", () => {
    // getAiProject held open until the test lets it answer.
    const holdProjectRead = () => {
      const pending: Record<number, (value: TAiProject) => void> = {};
      api.getAiProject.mockImplementation(
        (id: number) =>
          new Promise<TAiProject>((resolve) => {
            pending[id] = resolve;
          }),
      );
      return (id: number, title: string) =>
        act(async () => {
          pending[id](project(id, title));
        });
    };

    const openChatWithProjects = async () => {
      api.getAiProjects.mockResolvedValue({ folders: [project(1, "Sales"), project(2, "Legal")] });
      const store = new AiPresetsStore();
      renderBridge(store);
      await flush();
      act(() => aiChatStore.setIsVisible(true));
      await flush();
      return store;
    };

    it("loses to a later pick whose read comes back first", async () => {
      const answer = holdProjectRead();
      const store = await openChatWithProjects();

      act(() => aiChatStore.agentPicker?.onSelect("1"));
      act(() => aiChatStore.agentPicker?.onSelect("2"));
      await answer(2, "Legal");
      await answer(1, "Sales");
      await flush();

      expect(store.activePreset?.id).toBe("2");
      expect(aiChatStore.applyPreset).toHaveBeenCalledTimes(1);
    });

    it("is called off by the default agent", async () => {
      const answer = holdProjectRead();
      const store = await openChatWithProjects();

      act(() => aiChatStore.agentPicker?.onSelect("1"));
      act(() => aiChatStore.agentPicker?.onSelect(null));
      await answer(1, "Sales");
      await flush();

      expect(store.activePreset).toBeNull();
      expect(aiChatStore.applyPreset).not.toHaveBeenCalled();
    });

    it("is called off by picking the agent the chat runs on again", async () => {
      const answer = holdProjectRead();
      const store = await openChatWithProjects();
      act(() => aiChatStore.agentPicker?.onSelect("1"));
      await answer(1, "Sales");
      await flush();
      expect(store.activePreset?.id).toBe("1");

      act(() => aiChatStore.agentPicker?.onSelect("2"));
      act(() => aiChatStore.agentPicker?.onSelect("1"));
      await answer(2, "Legal");
      await flush();

      expect(store.activePreset?.id).toBe("1");
      expect(aiChatStore.applyPreset).toHaveBeenCalledTimes(1);
    });

    it("is called off by closing the chat, which opens clean next time", async () => {
      const answer = holdProjectRead();
      const store = await openChatWithProjects();

      act(() => aiChatStore.agentPicker?.onSelect("1"));
      act(() => aiChatStore.setIsVisible(false));
      await answer(1, "Sales");
      await flush();

      expect(store.activePreset).toBeNull();
      expect(aiChatStore.applyPreset).not.toHaveBeenCalled();
    });
  });
});
