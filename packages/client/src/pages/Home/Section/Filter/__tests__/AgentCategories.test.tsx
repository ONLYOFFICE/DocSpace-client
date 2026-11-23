import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getRooms: vi.fn(),
}));

vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@docspace/shared/api/rooms", () => ({ getRooms: mocks.getRooms }));

import { AgentCategories } from "../AgentCategories";

const agent = (id: number, tags: string[]) => ({ id, isRoom: true, roomType: RoomsType.AiProjectRoom, tags });

const agentsFilter = (tags: string[] | null = null) => {
  const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AiHub);
  filter.searchArea = RoomSearchArea.AiHub;
  filter.tags = tags;
  return filter;
};

const tabs = () => screen.queryAllByTestId("ai-agent-category").map((tab) => tab.textContent);

describe("AgentCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists All and the tags of the listed agents", () => {
    render(
      <AgentCategories
        userId="u1"
        roomsFilter={agentsFilter()}
        folders={[agent(1, ["Legal"]), agent(2, ["Reports", "Legal"]), agent(3, ["HR docs"])]}
      />,
    );
    expect(tabs()).toEqual(["Common:All", "Legal", "Reports", "HR docs"]);
    // The list holds every agent: nothing is read again.
    expect(mocks.getRooms).not.toHaveBeenCalled();
  });

  it("shows no row while no agent carries a tag", () => {
    render(<AgentCategories userId="u2" roomsFilter={agentsFilter()} folders={[agent(1, []), agent(2, [])]} />);
    expect(screen.queryByTestId("ai-agent-categories")).not.toBeInTheDocument();
  });

  it("narrows the list to a category through the address", () => {
    render(
      <AgentCategories userId="u3" roomsFilter={agentsFilter()} folders={[agent(1, ["Legal"]), agent(2, ["Reports"])]} />,
    );
    fireEvent.click(screen.getByText("Legal"));
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
    const url = mocks.navigate.mock.calls[0][0] as string;
    expect(url).toMatch(/^\/ai-rooms\/filter\?/);
    expect(JSON.parse(new URLSearchParams(url.split("?")[1]).get("tags") ?? "null")).toEqual(["Legal"]);

    // All is chosen already: nothing to do.
    fireEvent.click(screen.getByText("Common:All"));
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
  });

  it("reads every agent again once the list is narrowed to a category", async () => {
    mocks.getRooms.mockResolvedValue({
      folders: [agent(1, ["Legal"]), agent(2, ["Reports"]), agent(3, ["HR docs"])],
    });
    render(<AgentCategories userId="u4" roomsFilter={agentsFilter(["Legal"])} folders={[agent(1, ["Legal"])]} />);

    await waitFor(() => expect(tabs()).toEqual(["Common:All", "Legal", "Reports", "HR docs"]));
    const filter = mocks.getRooms.mock.calls[0][0] as RoomsFilter;
    expect(filter.tags).toBeFalsy();
    expect(filter.type).toEqual([String(RoomsType.AiProjectRoom)]);

    // Back to all of them.
    fireEvent.click(screen.getByText("Common:All"));
    const url = mocks.navigate.mock.calls[0][0] as string;
    expect(new URLSearchParams(url.split("?")[1]).has("tags")).toBe(false);
  });

  it("keeps a chosen tag that no listed agent carries", async () => {
    mocks.getRooms.mockResolvedValue({ folders: [agent(1, ["Reports"])] });
    render(<AgentCategories userId="u5" roomsFilter={agentsFilter(["Gone"])} folders={[]} />);

    await waitFor(() => expect(tabs()).toEqual(["Common:All", "Reports", "Gone"]));
  });
});
