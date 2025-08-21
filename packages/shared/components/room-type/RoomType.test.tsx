import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RoomsType } from "../../enums";
import RoomType from "./index";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

describe("RoomType", () => {
  const defaultProps = {
    type: "listItem" as const,
    roomType: RoomsType.EditingRoom,
    onClick: jest.fn(),

    isOpen: false,
    selectedId: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("List Item Type", () => {
    it("renders list item with correct content", () => {
      render(<RoomType {...defaultProps} />);

      const listItem = screen.getByTestId("room-type-list-item");
      expect(listItem).toBeInTheDocument();
      expect(
        screen.getByText("Common:CollaborationRoomTitle"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Common:CollaborationRoomDescription"),
      ).toBeInTheDocument();
    });

    it("handles click events", () => {
      render(<RoomType {...defaultProps} />);

      const listItem = screen.getByTestId("room-type-list-item");
      fireEvent.click(listItem);

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it("applies isOpen class when isOpen prop is true", () => {
      render(<RoomType {...defaultProps} isOpen />);

      const listItem = screen.getByTestId("room-type-list-item");
      expect(listItem).toHaveClass("isOpen");
    });
  });

  describe("Dropdown Button Type", () => {
    const dropdownProps = {
      ...defaultProps,
      type: "dropdownButton" as const,
    };

    it("renders dropdown button with correct content", () => {
      render(<RoomType {...dropdownProps} />);

      const dropdownButton = screen.getByTestId("room-type-dropdown-button");
      expect(dropdownButton).toBeInTheDocument();
      expect(
        screen.getByText("Common:CollaborationRoomTitle"),
      ).toBeInTheDocument();
    });

    it("handles click events", () => {
      render(<RoomType {...dropdownProps} />);

      const dropdownButton = screen.getByTestId("room-type-dropdown-button");
      fireEvent.click(dropdownButton);

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it("applies isOpen class when isOpen prop is true", () => {
      render(<RoomType {...dropdownProps} isOpen />);

      const dropdownButton = screen.getByTestId("room-type-dropdown-button");
      expect(dropdownButton).toHaveClass("isOpen");
    });
  });

  describe("Dropdown Item Type", () => {
    const dropdownItemProps = {
      ...defaultProps,
      type: "dropdownItem" as const,
    };

    it("handles click events", () => {
      render(<RoomType {...dropdownItemProps} />);

      const dropdownItem = screen.getByTestId("room-type-dropdown-item");
      fireEvent.click(dropdownItem);

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Display Item Type", () => {
    const displayItemProps = {
      ...defaultProps,
      type: "dropdownButton" as const,
    };

    it("renders display item with correct content", () => {
      render(<RoomType {...displayItemProps} />);

      expect(
        screen.getByText("Common:CollaborationRoomTitle"),
      ).toBeInTheDocument();
    });
  });

  describe("Room Type Variations", () => {
    it("renders Virtual Data Room type correctly", () => {
      render(
        <RoomType {...defaultProps} roomType={RoomsType.VirtualDataRoom} />,
      );

      expect(screen.getByText("Common:VirtualDataRoom")).toBeInTheDocument();
      expect(
        screen.getByText("Common:VirtualDataRoomDescription"),
      ).toBeInTheDocument();
    });

    it("renders Custom Room type correctly", () => {
      render(<RoomType {...defaultProps} roomType={RoomsType.CustomRoom} />);

      expect(screen.getByText("Common:CustomRoomTitle")).toBeInTheDocument();
      expect(
        screen.getByText("Common:CustomRoomDescription"),
      ).toBeInTheDocument();
    });
  });

  describe("Additional Props", () => {
    it("passes id prop correctly", () => {
      const testId = "test-room-type";
      render(<RoomType {...defaultProps} id={testId} />);

      const element = screen.getByTestId("room-type-list-item");
      expect(element).toHaveAttribute("id", testId);
    });

    it("passes selectedId prop correctly", () => {
      const selectedId = "selected-room";
      render(<RoomType {...defaultProps} selectedId={selectedId} />);

      const element = screen.getByTestId("room-type-list-item");
      expect(element).toHaveAttribute("data-selected-id", selectedId);
    });
  });
});
