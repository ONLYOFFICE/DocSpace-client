import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";

const api = vi.hoisted(() => ({
  getAiProject: vi.fn(),
  getAiProjectSkills: vi.fn(),
}));
const store = vi.hoisted(() => ({
  openEditDialogById: vi.fn(),
  projectRevisions: {} as Record<number, number>,
}));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("SRC_DIR/store/useStore", () => ({ useStore: () => store }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("SRC_DIR/pages/AiProjects/sub-components/project/RoomItem", () => ({
  default: ({ title, onToggle }: { title: string; onToggle?: () => void }) => (
    <div data-testid="room">
      {title}
      {onToggle ? (
        <button type="button" data-testid={`toggle-${title}`} onClick={onToggle} />
      ) : null}
    </div>
  ),
}));

import AiAgentContext from "../index";

const room = (id: number, title: string, available = true) => ({ id, title, available });

const project = (canEditSettings: boolean) => ({
  aiProject: {
    instructionsRooms: [room(1, "Legal"), room(2, "Gone", false)],
    knowledgeRooms: [room(3, "Wiki")],
    canEditSettings,
  },
});

beforeEach(() => {
  api.getAiProject.mockReset().mockResolvedValue(project(true));
  api.getAiProjectSkills
    .mockReset()
    .mockResolvedValue([{ id: 1, skills: [{ id: "9", name: "clause-check", description: "Checks" }] }]);
  store.openEditDialogById.mockReset();
  store.projectRevisions = observable({});
});

describe("AiAgentContext", () => {
  it("lists the skill sets and knowledge bases the caller can read", async () => {
    render(<AiAgentContext id={7} />);
    const rooms = await screen.findAllByTestId("room");
    expect(rooms.map((node) => node.textContent)).toEqual(["Legal", "Wiki"]);
  });

  it("unfolds a skill set to its skills", async () => {
    render(<AiAgentContext id={7} />);
    fireEvent.click(await screen.findByTestId("toggle-Legal"));
    expect(screen.getByText("clause-check")).toBeTruthy();
  });

  it("shows the sets without their skills when the skills cannot be read", async () => {
    api.getAiProjectSkills.mockRejectedValue(new Error("down"));
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(screen.queryByTestId("toggle-Legal")).toBeNull();
  });

  it("offers a Manage row under each section to those who may edit the agent, which opens its form", async () => {
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
    expect(store.openEditDialogById).toHaveBeenCalledTimes(2);
    expect(store.openEditDialogById).toHaveBeenCalledWith(7);
  });

  it("reads the agent again once it is saved, keeping what it shows meanwhile", async () => {
    render(<AiAgentContext id={7} />);
    await screen.findAllByTestId("room");
    expect(api.getAiProject).toHaveBeenCalledTimes(1);

    api.getAiProject.mockResolvedValue({
      aiProject: { instructionsRooms: [room(1, "Legal")], knowledgeRooms: [room(4, "Policies")], canEditSettings: true },
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

  it("says so when the agent cannot be read", async () => {
    api.getAiProject.mockRejectedValue(new Error("down"));
    render(<AiAgentContext id={7} />);
    expect(await screen.findByTestId("ai-agent-context-error")).toBeTruthy();
  });
});
