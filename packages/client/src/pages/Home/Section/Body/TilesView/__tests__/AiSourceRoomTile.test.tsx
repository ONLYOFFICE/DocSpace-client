import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RoomsType } from "@docspace/shared/enums";

const knowledgeBasesStore = vi.hoisted(() => ({
  states: {} as Record<string, { total: number; inProgress: number; failed: number }>,
  get: vi.fn(),
  fetch: vi.fn(),
}));
const settingsStore = vi.hoisted(() => ({ culture: "en", theme: { isBase: true } }));

vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: string) =>
    name === "knowledgeBasesStore" ? knowledgeBasesStore : settingsStore,
}));

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

import AiSourceRoomTile from "../AiSourceRoomTile";

const openUser = vi.fn();
const renderTile = (item: object, thumbnailClick = vi.fn()) => {
  render(
    <AiSourceRoomTile
      item={
        {
          id: 7,
          title: "Contract review",
          filesCount: 3,
          updated: "2026-11-17T10:00:00.0000000+00:00",
          createdBy: { displayName: "Alexey Bannov" },
          ...item,
        } as never
      }
      openUser={openUser}
      contextOptions={[]}
      thumbnailClick={thumbnailClick}
    >
      <span>Contract review</span>
    </AiSourceRoomTile>,
  );
  return thumbnailClick;
};

const value = (key: string) => screen.queryByTestId(`ai-source-room-tile-${key}`)?.textContent;

describe("AiSourceRoomTile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    knowledgeBasesStore.get.mockReturnValue(null);
  });

  it("tells a skill set's skills, owner and last modification, as its table row does", () => {
    renderTile({ roomType: RoomsType.InstructionsRoom });
    expect(screen.getByText("Common:Skills")).toBeInTheDocument();
    expect(value("skills")).toBe("3");
    expect(screen.getByText("Common:Owner")).toBeInTheDocument();
    expect(screen.getByText("Alexey Bannov")).toBeInTheDocument();
    expect(screen.getByText("Common:LastModified")).toBeInTheDocument();
    expect(value("modified")).toBeTruthy();
    // A skill set has no indexing state to read.
    expect(knowledgeBasesStore.fetch).not.toHaveBeenCalled();
  });

  it("tells a knowledge base's owner and last modification, without a skills count", () => {
    renderTile({ roomType: RoomsType.KnowledgeRoom });
    expect(value("skills")).toBeUndefined();
    expect(screen.getByText("Alexey Bannov")).toBeInTheDocument();
    expect(knowledgeBasesStore.fetch).toHaveBeenCalledWith({ id: 7, filesCount: 3 });
  });

  it("marks a knowledge base whose files are being indexed beside its name", () => {
    knowledgeBasesStore.get.mockReturnValue({ total: 2, inProgress: 1, failed: 0 });
    renderTile({ roomType: RoomsType.KnowledgeRoom });
    expect(screen.getByTestId("knowledge-base-indexing-badge")).toBeInTheDocument();
  });

  it("names the owner, whose name opens their profile and not the room", () => {
    const thumbnailClick = renderTile({ roomType: RoomsType.InstructionsRoom });
    fireEvent.click(screen.getByText("Alexey Bannov"));
    expect(openUser).toHaveBeenCalledTimes(1);
    expect(thumbnailClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("ai-source-room-tile-summary"));
    expect(thumbnailClick).toHaveBeenCalledTimes(1);
  });
});
