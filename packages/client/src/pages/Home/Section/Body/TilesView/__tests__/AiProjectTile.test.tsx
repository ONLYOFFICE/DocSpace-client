import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

type TSummary = { model: string | null; modelAvailable: boolean; skills: string[]; knowledge: string[] };

const store = vi.hoisted(() => ({
  tileSummaries: {} as Record<number, unknown>,
  defaultModelName: null as string | null,
  fetchTileSummary: vi.fn(async () => {}),
}));

vi.mock("SRC_DIR/store/useStore", () => ({ useStore: () => store }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The tile's frame: the two halves it is handed, and the click on the tile.
vi.mock("@onlyoffice/apps-ui-kit/components/tiles/base-tile", () => ({
  BaseTile: ({
    topContent,
    bottomContent,
    onRoomClick,
  }: {
    topContent: React.ReactNode;
    bottomContent: React.ReactNode;
    onRoomClick: (e: React.MouseEvent) => void;
  }) => (
    <div data-testid="tile" onClick={onRoomClick}>
      <div data-testid="top">{topContent}</div>
      {bottomContent}
    </div>
  ),
}));

import AiProjectTile from "../AiProjectTile";

const openUser = vi.fn();
const renderTile = (thumbnailClick = vi.fn()) => {
  render(
    <AiProjectTile
      item={{ id: 7, title: "Legal Reviewer", createdBy: { displayName: "Alexey Bannov" } } as never}
      openUser={openUser}
      contextOptions={[]}
      thumbnailClick={thumbnailClick}
      badges={<div className="badges" data-testid="badges" />}
    >
      <span>Legal Reviewer</span>
    </AiProjectTile>,
  );
  return thumbnailClick;
};

const value = (key: string) => screen.getByTestId(`ai-project-tile-${key}`).textContent;

describe("AiProjectTile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.tileSummaries = {};
  });

  it("asks for the project's summary and shows dashes until it lands", () => {
    renderTile();
    expect(store.fetchTileSummary).toHaveBeenCalledWith(7);
    expect(value("model")).toBe("—");
    expect(value("skills")).toBe("—");
    expect(value("knowledge")).toBe("—");
  });

  it("names the model, the skill sets and the knowledge bases", () => {
    const summary: TSummary = {
      model: "GLM 5.3 Flash",
      modelAvailable: true,
      skills: ["Legal", "Sales"],
      knowledge: ["Wiki"],
    };
    store.tileSummaries = { 7: summary };
    renderTile();
    expect(screen.getByText("Common:AIAgentModel")).toBeInTheDocument();
    expect(screen.getByText("Common:SkillSets")).toBeInTheDocument();
    expect(screen.getByText("Common:AIProjectKnowledgeRooms")).toBeInTheDocument();
    expect(value("model")).toBe("GLM 5.3 Flash");
    expect(value("skills")).toBe("Legal, Sales");
    expect(value("knowledge")).toBe("Wiki");
  });

  it("names the portal's chat model for a project without a model of its own, and a dash for no rooms", () => {
    store.tileSummaries = { 7: { model: null, modelAvailable: true, skills: [], knowledge: [] } };
    store.defaultModelName = "GLM 5.3 Flash";
    renderTile();
    expect(value("model")).toBe("GLM 5.3 Flash");
    expect(value("skills")).toBe("—");
  });

  it("shows a dash while the portal's chat model is unknown, never Default", () => {
    store.tileSummaries = { 7: { model: null, modelAvailable: true, skills: [], knowledge: [] } };
    store.defaultModelName = null;
    renderTile();
    expect(value("model")).toBe("—");
  });

  it("names the owner, whose name opens their profile and not the project", () => {
    const thumbnailClick = renderTile();
    expect(screen.getByText("Common:Owner")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Alexey Bannov"));
    expect(openUser).toHaveBeenCalledTimes(1);
    expect(thumbnailClick).not.toHaveBeenCalled();
  });

  it("opens the project on a click on the tile, but not on its badges", () => {
    const thumbnailClick = renderTile();
    fireEvent.click(screen.getByTestId("badges"));
    expect(thumbnailClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("ai-project-tile-summary"));
    expect(thumbnailClick).toHaveBeenCalledTimes(1);
  });
});
