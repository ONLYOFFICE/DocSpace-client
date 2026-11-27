import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";

const api = vi.hoisted(() => ({
  getAiProject: vi.fn(),
  getAiProjectSkills: vi.fn(),
}));
const files = vi.hoisted(() => ({ getFileInfo: vi.fn() }));
const toastr = vi.hoisted(() => ({ error: vi.fn() }));
const store = vi.hoisted(() => ({
  openRoomsSelector: vi.fn(),
  unlinkRoom: vi.fn(),
  // The skill dialog (`dialogsStore`).
  setEditSkillFile: vi.fn(),
  projectRevisions: {} as Record<number, number>,
  // The agent the chat runs on (`aiPresetsStore`).
  activePreset: null as { id: string } | null,
}));
// The chat's own stores: its data sources and the selector that adds one.
const chat = vi.hoisted(() => ({
  folders: [] as { cloud: string; room: { id: string; name: string; kind?: string } }[],
  deselectFolderContext: vi.fn(),
  addDataSource: null as (() => void) | null,
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("@docspace/shared/api/files", () => files);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("SRC_DIR/store/useStore", () => ({ useStore: () => store }));
vi.mock("@onlyoffice/ai-chat", () => ({ FOLDER_CONTEXTS_LIMIT: 2 }));
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers", () => ({
  // The chat library's own translations: its keys have no namespace.
  useI18n: () => ({ t: (key: string) => `chat:${key}` }),
  useStores: () => ({
    useCloudsStore: (pick: (state: object) => unknown) =>
      pick({
        selectedFolderContexts: chat.folders,
        deselectFolderContext: chat.deselectFolderContext,
      }),
  }),
}));
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStoreOptional: () => ({ addDataSource: chat.addDataSource }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("SRC_DIR/pages/AiProjects/sub-components/project/RoomItem", () => ({
  default: ({
    title,
    isPlainIcon,
    onToggle,
  }: {
    title: string;
    isPlainIcon?: boolean;
    onToggle?: () => void;
  }) => (
    <div data-testid="room" data-plain-icon={!!isPlainIcon}>
      {title}
      {onToggle ? (
        <button type="button" data-testid={`toggle-${title}`} onClick={onToggle} />
      ) : null}
    </div>
  ),
}));

import AiAgentContext from "../index";

const room = (id: number, title: string, available = true) => ({ id, title, available });

// `canEdit` is the room's EditRoom right, which the agent's settings ask.
const project = (canEdit: boolean, inRoom = true) => ({
  inRoom,
  security: { EditRoom: canEdit },
  aiProject: {
    instructionsRooms: [room(1, "Legal"), room(2, "Gone", false)],
    knowledgeRooms: [room(3, "Wiki")],
  },
});

beforeEach(() => {
  api.getAiProject.mockReset().mockResolvedValue(project(true));
  api.getAiProjectSkills
    .mockReset()
    .mockResolvedValue([{ id: 1, skills: [{ id: "9", name: "clause-check", description: "Checks" }] }]);
  store.openRoomsSelector.mockReset();
  store.unlinkRoom.mockReset();
  store.setEditSkillFile.mockReset();
  files.getFileInfo.mockReset();
  toastr.error.mockReset();
  store.projectRevisions = observable({});
  store.activePreset = null;
  chat.folders = [];
  chat.deselectFolderContext.mockReset();
  chat.addDataSource = null;
});

describe("AiAgentContext", () => {
  it("lists the skill sets and knowledge bases the caller can read", async () => {
    render(<AiAgentContext id={7} />);
    const rooms = await screen.findAllByTestId("room");
    expect(rooms.map((node) => node.textContent)).toEqual(["Legal", "Wiki"]);
  });

  it("shows every skill set unfolded to its skills, each with the skill icon", async () => {
    render(<AiAgentContext id={7} />);
    const skill = await screen.findByText("clause-check");
    expect(skill.closest("li")?.querySelector('[data-testid="skill-icon-skill"]')).toBeTruthy();
  });

  it("draws a skill set without the square behind its icon, and a knowledge base with it", async () => {
    render(<AiAgentContext id={5} />);
    await screen.findByText("clause-check");
    const [set, base] = screen.getAllByTestId("room");
    expect(set.dataset.plainIcon).toBe("true");
    expect(base.dataset.plainIcon).toBe("false");
  });

  it("tells a skill's description in the tab's tooltip, not the browser's title", async () => {
    render(<AiAgentContext id={5} />);
    const skill = await screen.findByTestId("ai-agent-context-skill");
    expect(skill.getAttribute("data-tooltip-id")).toBe("ai-agent-context-tooltip");
    expect(skill.getAttribute("data-tooltip-content")).toBe("Checks");
    expect(skill.hasAttribute("title")).toBe(false);
  });

  it("opens a skill's instructions to read on a click on the skill", async () => {
    const file = { id: 9, title: "Clause check.md" };
    files.getFileInfo.mockResolvedValue(file);
    render(<AiAgentContext id={5} />);
    fireEvent.click(await screen.findByTestId("ai-agent-context-skill"));
    expect(files.getFileInfo).toHaveBeenCalledWith("9");
    await vi.waitFor(() => expect(store.setEditSkillFile).toHaveBeenCalledWith(file, true));
  });

  it("says why a skill that cannot be read did not open", async () => {
    const error = new Error("Forbidden");
    files.getFileInfo.mockRejectedValue(error);
    render(<AiAgentContext id={5} />);
    fireEvent.click(await screen.findByTestId("ai-agent-context-skill"));
    await vi.waitFor(() => expect(toastr.error).toHaveBeenCalledWith(error));
    expect(store.setEditSkillFile).not.toHaveBeenCalled();
  });

  it("folds a skill set by hand and unfolds it again", async () => {
    render(<AiAgentContext id={7} />);
    const toggle = await screen.findByTestId("toggle-Legal");
    fireEvent.click(toggle);
    expect(screen.queryByText("clause-check")).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText("clause-check")).toBeTruthy();
  });

  it("shows the sets without their skills when the skills cannot be read", async () => {
    api.getAiProjectSkills.mockRejectedValue(new Error("down"));
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(screen.queryByTestId("toggle-Legal")).toBeNull();
  });

  it("offers a Manage row under each section to those who may edit the agent, which opens the selector of its rooms", async () => {
    render(<AiAgentContext id={7} />);
    const skills = await screen.findByTestId("ai-agent-context-manage-skills");
    const knowledge = screen.getByTestId("ai-agent-context-manage-knowledge");
    expect(skills.textContent).toBe("Common:ManageSkillSets");
    expect(knowledge.textContent).toBe("Common:ManageKnowledgeBases");
    // Each row sits in its own section, under its rooms.
    expect(screen.getByTestId("ai-agent-context-skills").contains(skills)).toBe(true);
    expect(screen.getByTestId("ai-agent-context-knowledge").contains(knowledge)).toBe(true);

    fireEvent.click(skills);
    fireEvent.click(knowledge);
    expect(store.openRoomsSelector).toHaveBeenCalledTimes(2);
    expect(store.openRoomsSelector).toHaveBeenNthCalledWith(1, 7, "instructions");
    expect(store.openRoomsSelector).toHaveBeenNthCalledWith(2, 7, "knowledge");
  });

  it("reads the agent again once it is saved, keeping what it shows meanwhile", async () => {
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(api.getAiProject).toHaveBeenCalledTimes(1);

    api.getAiProject.mockResolvedValue({
      inRoom: true,
      security: { EditRoom: true },
      aiProject: { instructionsRooms: [room(1, "Legal")], knowledgeRooms: [room(4, "Policies")] },
    });
    act(() => {
      runInAction(() => {
        store.projectRevisions[7] = 1;
      });
    });
    // The rooms stay on screen while the agent is read again.
    expect(screen.getAllByTestId("room").length).toBeGreaterThan(0);

    expect(await screen.findByText("Policies")).toBeTruthy();
    expect(api.getAiProject).toHaveBeenCalledTimes(2);
  });

  it("offers a member no Manage rows", async () => {
    api.getAiProject.mockResolvedValue(project(false));
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(screen.queryByTestId("ai-agent-context-manage-skills")).toBeNull();
    expect(screen.queryByTestId("ai-agent-context-manage-knowledge")).toBeNull();
  });

  // A DocSpace admin reads an agent they are not in with full rights.
  it("offers no Manage rows to someone outside the agent, whatever rights the room answers", async () => {
    api.getAiProject.mockResolvedValue(project(true, false));
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(screen.queryByTestId("ai-agent-context-manage-skills")).toBeNull();
    expect(screen.queryByTestId("ai-agent-context-manage-knowledge")).toBeNull();
  });

  it("ends every skill set and knowledge base with a bin that unlinks it, for those who may edit the agent", async () => {
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    fireEvent.click(screen.getByTestId("ai-agent-context-remove-instructions"));
    fireEvent.click(screen.getByTestId("ai-agent-context-remove-knowledge"));
    expect(store.unlinkRoom).toHaveBeenNthCalledWith(1, 7, "instructions", 1);
    expect(store.unlinkRoom).toHaveBeenNthCalledWith(2, 7, "knowledge", 3);
  });

  it("offers no bin to one who may not edit the agent", async () => {
    api.getAiProject.mockResolvedValue(project(false));
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(screen.queryByTestId("ai-agent-context-remove-instructions")).toBeNull();
    expect(screen.queryByTestId("ai-agent-context-remove-knowledge")).toBeNull();
  });

  it("heads each section with what the assistant does with it, which is all an empty one shows", async () => {
    api.getAiProject.mockResolvedValue({
      inRoom: true,
      security: { EditRoom: false },
      aiProject: { instructionsRooms: [], knowledgeRooms: [] },
    });
    render(<AiAgentContext id={7} />);
    const skills = await screen.findByTestId("ai-agent-context-skills");
    expect(screen.getByTestId("ai-agent-context-skills-hint").textContent).toBe("chat:SkillSetsHint");
    expect(screen.getByTestId("ai-agent-context-knowledge-hint").textContent).toBe("chat:KnowledgeBasesHint");
    expect(screen.queryAllByTestId("room")).toEqual([]);
    expect(skills.textContent).toBe("Common:SkillSetschat:SkillSetsHint");
  });

  describe("Data sources", () => {
    const folder = (id: string, name: string, kind?: string) => ({
      cloud: "docspace",
      room: { id, name, ...(kind ? { kind } : {}) },
    });

    it("are left out while the chat does not run on the agent", async () => {
      store.activePreset = { id: "8" };
      chat.folders = [folder("20", "Contracts")];
      render(<AiAgentContext id={7} />);
      await screen.findByTestId("ai-agent-context");
      expect(screen.queryByTestId("ai-agent-context-data-sources")).toBeNull();
    });

    it("list the folders and rooms of the chat on the agent, each with its remove control", async () => {
      store.activePreset = { id: "7" };
      chat.folders = [folder("20", "Contracts"), folder("21", "Sales room", "room")];
      render(<AiAgentContext id={7} />);
      const section = await screen.findByTestId("ai-agent-context-data-sources");
      expect(section.textContent).toContain("chat:DataSourcesHint");
      const rows = screen.getAllByTestId("ai-agent-context-data-source");
      expect(rows.map((row) => row.textContent)).toEqual(["Contracts", "Sales room"]);

      fireEvent.click(screen.getAllByTestId("ai-agent-context-remove-data-source")[1]);
      expect(chat.deselectFolderContext).toHaveBeenCalledWith("docspace", "21");
    });

    it("offer \"Manage sources...\" to a member who cannot edit the agent, until the limit", async () => {
      api.getAiProject.mockResolvedValue(project(false));
      store.activePreset = { id: "7" };
      chat.addDataSource = vi.fn();
      chat.folders = [folder("20", "Contracts")];
      const { unmount } = render(<AiAgentContext id={7} />);
      fireEvent.click(await screen.findByTestId("ai-agent-context-manage-data-sources"));
      expect(chat.addDataSource).toHaveBeenCalledTimes(1);
      unmount();

      chat.folders = [folder("20", "Contracts"), folder("21", "Sales")];
      render(<AiAgentContext id={7} />);
      await screen.findByTestId("ai-agent-context-data-sources");
      expect(screen.queryByTestId("ai-agent-context-manage-data-sources")).toBeNull();
    });

    it("show the caption and the line only when the chat has none", async () => {
      store.activePreset = { id: "7" };
      render(<AiAgentContext id={7} />);
      const section = await screen.findByTestId("ai-agent-context-data-sources");
      expect(section.textContent).toBe("chat:DataSourceschat:DataSourcesHint");
    });
  });

  it("says so when the agent cannot be read", async () => {
    api.getAiProject.mockRejectedValue(new Error("down"));
    render(<AiAgentContext id={7} />);
    expect(await screen.findByTestId("ai-agent-context-error")).toBeTruthy();
  });
});
