// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContextMenuModel } from "../../context-menu/ContextMenu.types";
import { RoomTile } from "./RoomTile";
import { RoomTileProps } from "./RoomTile.types";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock styles
jest.mock("./RoomTile.module.scss", () => ({
  roomTile: "roomTile",
}));

interface TagProps {
  label: string;
  onClick?: () => void;
  isDefault?: boolean;
  isThirdParty?: boolean;
  icon?: string;
  roomType?: number | string;
  providerType?: number | string;
}

// Mock Tags component
jest.mock("@docspace/shared/components/tags", () => ({
  Tags: ({
    tags,
    onSelectTag,
  }: {
    tags: TagProps[];
    onSelectTag?: (tag: TagProps) => void;
  }) => (
    <div data-testid="tags" className="tags">
      {tags.map((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        const onClick =
          typeof tag === "string"
            ? undefined
            : () => {
                if (tag.onClick) tag.onClick();
                if (onSelectTag) onSelectTag(tag);
              };

        return (
          <div
            key={label}
            data-testid={`tag-${label}`}
            onClick={onClick}
            className="tags"
          >
            {label}
          </div>
        );
      })}
    </div>
  ),
}));

interface BaseTileProps {
  onHover?: () => void;
  onLeave?: () => void;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  className?: string;
  onRoomClick?: () => void;
}

// Mock BaseTile component
jest.mock("../base-tile/BaseTile", () => ({
  BaseTile: ({
    onHover,
    onLeave,
    topContent,
    bottomContent,
    className,
    onRoomClick,
  }: BaseTileProps) => (
    <div
      data-testid="base-tile"
      className={className}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onRoomClick}
    >
      {topContent}
      {bottomContent}
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
    tags: [{ label: "Custom Tag" }],
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
    const tag = screen.getByTestId("tag-provider-key");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("provider-key");
  });

  it("renders custom tags when provided", () => {
    renderRoomTile();
    const tag = screen.getByTestId("tag-Custom Tag");
    expect(tag).toBeTruthy();
    expect(tag.textContent).toBe("Custom Tag");
  });

  it("renders default room type tag when no custom tags", () => {
    const itemWithoutTags = {
      ...mockItem,
      tags: [],
      providerType: undefined,
      providerKey: undefined,
    };
    const getRoomTypeName = jest.fn().mockReturnValue("Collaborative Room");

    renderRoomTile({
      item: itemWithoutTags,
      getRoomTypeName,
    });

    const tag = screen.getByTestId("tag-Collaborative Room");
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

    const providerTag = screen.getByTestId("tag-provider-key");
    fireEvent.click(providerTag);

    expect(selectOption).toHaveBeenCalledWith({
      option: "typeProvider",
      value: mockProviderType,
    });
  });

  it("calls selectOption with room type when default tag is clicked", () => {
    const selectOption = jest.fn();
    const getRoomTypeName = jest.fn().mockReturnValue("Collaborative Room");
    const itemWithoutTags = { ...mockItem, tags: [] };

    renderRoomTile({
      item: itemWithoutTags,
      selectOption,
      getRoomTypeName,
    });

    const roomTypeTag = screen.getByTestId("tag-Collaborative Room");
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
