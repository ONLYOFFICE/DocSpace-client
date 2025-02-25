import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { RoomTile } from "./RoomTile";
import { RoomTileProps } from "./RoomTile.types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu/ContextMenu.types";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock styles
jest.mock("./RoomTile.module.scss", () => ({
  roomTile: "roomTile",
}));

// Mock Tags component
jest.mock("@docspace/shared/components/tags", () => ({
  Tags: ({ tags }: { tags: any[] }) => (
    <div data-testid="tags" className="tags">
      {tags.map((tag, index) => (
        <div
          key={index}
          data-testid={`tag-${index}`}
          onClick={tag.onClick}
          className="tags"
        >
          {tag.label}
        </div>
      ))}
    </div>
  ),
}));

// Mock BaseTile component
jest.mock("../base-tile/BaseTile", () => ({
  BaseTile: ({
    item,
    isHovered,
    onHover,
    onLeave,
    topContent,
    bottomContent,
    onRoomClick,
    className,
  }: any) => (
    <div
      data-testid="base-tile"
      className={className}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onRoomClick}
    >
      <div data-testid="top-content">{topContent}</div>
      <div data-testid="bottom-content">{bottomContent}</div>
    </div>
  ),
}));

describe("RoomTile", () => {
  const mockRoomType = "collaborative";
  const mockProviderType = "personal";

  const mockItem = {
    id: "1",
    title: "Test Room",
    roomType: mockRoomType,
    providerType: mockProviderType,
    providerKey: "provider-key",
    thirdPartyIcon: "icon-url",
    tags: [{ label: "Custom Tag", id: "1" }],
  };

  const mockContextOptions: ContextMenuModel[] = [
    { key: "edit", label: "Edit", onClick: jest.fn() },
    { key: "delete", label: "Delete", onClick: jest.fn() },
  ];

  const RoomContent = () => (
    <div data-testid="room-content">{mockItem.title}</div>
  );

  const renderRoomTile = (props: Partial<RoomTileProps> = {}) => {
    const defaultProps: RoomTileProps = {
      item: mockItem,
      children: <RoomContent />,
      columnCount: 3,
      selectTag: jest.fn(),
      selectOption: jest.fn(),
      getRoomTypeName: jest.fn().mockReturnValue("Room Type Name"),
      thumbnailClick: jest.fn(),
      contextOptions: mockContextOptions,
      onSelect: jest.fn(),
      checked: false,
      isActive: false,
      isBlockingOperation: false,
      inProgress: false,
      isEdit: false,
      showHotkeyBorder: false,
      ...props,
    };

    return render(<RoomTile {...defaultProps} />);
  };

  it("renders room title correctly", () => {
    renderRoomTile();
    expect(screen.getByTestId("room-content")).toBeTruthy();
    expect(screen.getByTestId("room-content").textContent).toBe("Test Room");
  });

  it("renders provider tag when providerType exists", () => {
    renderRoomTile();
    const tag = screen.getByTestId("tag-0");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("provider-key");
  });

  it("renders custom tags when provided", () => {
    renderRoomTile();
    const tag = screen.getByTestId("tag-1");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("Custom Tag");
  });

  it("renders default room type tag when no custom tags", () => {
    const itemWithoutTags = { ...mockItem, tags: [] };
    const getRoomTypeName = jest.fn().mockReturnValue("Collaborative Room");

    renderRoomTile({
      item: itemWithoutTags,
      getRoomTypeName,
    });

    const tag = screen.getByTestId("tag-1");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("Collaborative Room");
    expect(getRoomTypeName).toHaveBeenCalledWith(
      mockRoomType,
      expect.any(Function),
    );
  });

  it("calls thumbnailClick when room is clicked", () => {
    const thumbnailClick = jest.fn();
    renderRoomTile({ thumbnailClick });

    const baseTile = screen.getByTestId("base-tile");
    fireEvent.click(baseTile);

    expect(thumbnailClick).toHaveBeenCalled();
  });

  it("calls selectOption with provider type when provider tag is clicked", () => {
    const selectOption = jest.fn();
    renderRoomTile({ selectOption });

    const providerTag = screen.getByTestId("tag-0");
    fireEvent.click(providerTag);

    expect(selectOption).toHaveBeenCalledWith({
      option: "typeProvider",
      value: mockProviderType,
    });
  });

  it("calls selectOption with room type when default tag is clicked", () => {
    const selectOption = jest.fn();
    const itemWithoutTags = { ...mockItem, tags: [] };

    renderRoomTile({
      item: itemWithoutTags,
      selectOption,
    });

    const roomTypeTag = screen.getByTestId("tag-1");
    fireEvent.click(roomTypeTag);

    expect(selectOption).toHaveBeenCalledWith({
      option: "defaultTypeRoom",
      value: mockRoomType,
    });
  });

  it("renders badges when provided", () => {
    const badges = <div data-testid="test-badge">Badge</div>;
    renderRoomTile({ badges });
    expect(screen.getByTestId("test-badge")).toBeTruthy();
  });

  it("handles hover states correctly", () => {
    renderRoomTile();
    const baseTile = screen.getByTestId("base-tile");

    fireEvent.mouseEnter(baseTile);
    // Here we could check for hover styles or states if needed

    fireEvent.mouseLeave(baseTile);
    // Here we could check that hover styles or states are removed
  });
});
