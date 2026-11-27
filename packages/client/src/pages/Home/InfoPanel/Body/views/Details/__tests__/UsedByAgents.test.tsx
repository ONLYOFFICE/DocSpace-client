import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

const api = vi.hoisted(() => ({ getAiRoomProjects: vi.fn() }));

vi.mock("@docspace/shared/api/ai/projects", () => api);
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo", () => ({
  default: ({ project }: { project: { id: number } }) => (
    <span data-testid={`logo-${project.id}`} />
  ),
}));

import { UsedByAgents } from "../sub-components/UsedByAgents";

const agent = (id: number, title: string) => ({ id, title, logo: { color: "#123456" } });

const skillSet = {
  id: 12,
  title: "Sales assistant",
  isRoom: true,
  roomType: RoomsType.InstructionsRoom,
  linkedProjectsCount: 2,
};

const titles = () =>
  screen.getAllByTestId("used-by-agents-name").map((item) => item.textContent);

beforeEach(() => {
  vi.clearAllMocks();
  api.getAiRoomProjects.mockResolvedValue({
    items: [agent(2, "Legal"), agent(5, "Sales")],
    total: 2,
  });
});

describe("UsedByAgents", () => {
  it("lists the agents that use a skill set, each by its logo and name", async () => {
    render(<UsedByAgents selection={skillSet} />);
    expect(await screen.findByText("Common:UsedByAgents")).toBeInTheDocument();
    expect(titles()).toEqual(["Legal", "Sales"]);
    expect(screen.getByTestId("logo-2")).toBeInTheDocument();
    expect(screen.queryByTestId("used-by-agents-more")).toBeNull();
    expect(api.getAiRoomProjects).toHaveBeenCalledWith(12, { count: 100 }, expect.anything());
  });

  it("opens an agent's page on a click on the agent", async () => {
    const onOpenAgent = vi.fn();
    render(<UsedByAgents selection={skillSet} onOpenAgent={onOpenAgent} />);
    const [legal] = await screen.findAllByTestId("used-by-agents-open");
    fireEvent.click(legal);
    expect(onOpenAgent).toHaveBeenCalledWith(2);
  });

  it("lists them for a knowledge base as well", async () => {
    render(<UsedByAgents selection={{ ...skillSet, roomType: RoomsType.KnowledgeRoom }} />);
    await waitFor(() => expect(titles()).toEqual(["Legal", "Sales"]));
  });

  it("tells by their number the agents past the page it reads", async () => {
    api.getAiRoomProjects.mockResolvedValue({ items: [agent(2, "Legal")], total: 4 });
    render(<UsedByAgents selection={skillSet} />);
    expect(await screen.findByTestId("used-by-agents-more")).toHaveTextContent("+3");
  });

  it("shows nothing for a room no agent the user may read uses", async () => {
    // Two agents use the set, neither readable by the user.
    api.getAiRoomProjects.mockResolvedValue({ items: [], total: 0 });
    const { container } = render(<UsedByAgents selection={skillSet} />);
    await waitFor(() => expect(api.getAiRoomProjects).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });

  it("does not ask for the agents of a room used by none, or of another room", () => {
    const { container, rerender } = render(
      <UsedByAgents selection={{ ...skillSet, linkedProjectsCount: 0 }} />,
    );
    rerender(<UsedByAgents selection={{ ...skillSet, roomType: RoomsType.CustomRoom }} />);
    rerender(<UsedByAgents selection={[skillSet]} />);
    expect(api.getAiRoomProjects).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it("leaves the list out when it cannot be read", async () => {
    api.getAiRoomProjects.mockRejectedValue(new Error("403"));
    const { container } = render(<UsedByAgents selection={skillSet} />);
    await waitFor(() => expect(api.getAiRoomProjects).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });

  it("reads the agents again when the room's number of them changes", async () => {
    const { rerender } = render(<UsedByAgents selection={skillSet} />);
    await waitFor(() => expect(api.getAiRoomProjects).toHaveBeenCalledTimes(1));
    rerender(<UsedByAgents selection={{ ...skillSet, linkedProjectsCount: 3 }} />);
    await waitFor(() => expect(api.getAiRoomProjects).toHaveBeenCalledTimes(2));
  });
});
