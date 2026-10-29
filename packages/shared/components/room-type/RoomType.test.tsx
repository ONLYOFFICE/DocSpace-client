import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RoomsType } from "../../enums";
import RoomType from "./index";
import styles from "./RoomType.module.scss";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

describe("RoomType", () => {
  const defaultProps = {
    type: "listItem" as const,
    roomType: RoomsType.EditingRoom,
    onClick: vi.fn(),

    isOpen: false,
    selectedId: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(listItem).toHaveClass(styles.isOpen);
    });

    it("is a button in the Tab order that Enter and Space choose", () => {
      render(<RoomType {...defaultProps} />);

      const listItem = screen.getByRole("button", {
        name: /Common:CollaborationRoomTitle/,
      });
      expect(listItem).toHaveAttribute("tabindex", "0");

      fireEvent.keyDown(listItem, { key: "Enter" });
      fireEvent.keyDown(listItem, { key: " " });
      expect(defaultProps.onClick).toHaveBeenCalledTimes(2);
    });

    // Choosing a type focuses the room name, whose Enter keyup creates the
    // room: the keyup of the press that chose the type must not get there.
    it("keeps the keyup of the Enter that chose it from the page", () => {
      render(<RoomType {...defaultProps} />);
      const onWindowKeyUp = vi.fn();
      window.addEventListener("keyup", onWindowKeyUp);

      const listItem = screen.getByTestId("room-type-list-item");
      fireEvent.keyDown(listItem, { key: "Enter" });
      fireEvent.keyUp(document.body, { key: "Enter" });

      window.removeEventListener("keyup", onWindowKeyUp);
      expect(onWindowKeyUp).not.toHaveBeenCalled();
    });

    it("calls onClick once for a click on the arrow", () => {
      render(<RoomType {...defaultProps} />);

      const arrow = screen
        .getByTestId("room-type-list-item")
        .querySelector(".choose_room-forward_btn");
      fireEvent.click(arrow!);

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it("refuses a disabled room type by click and by keyboard", () => {
      render(
        <RoomType
          {...defaultProps}
          roomType={RoomsType.PublicRoom}
          disabledPublicRoom
        />,
      );

      const listItem = screen.getByTestId("room-type-list-item");
      expect(listItem).toHaveAttribute("aria-disabled", "true");
      fireEvent.click(listItem);
      fireEvent.keyDown(listItem, { key: "Enter" });
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    // Enter on a disabled type swallowed the keyup that followed anywhere
    // on the page, though nothing was chosen.
    it("leaves the keyup to the page when a disabled type ignores the key", () => {
      render(
        <RoomType
          {...defaultProps}
          roomType={RoomsType.PublicRoom}
          disabledPublicRoom
        />,
      );
      const onWindowKeyUp = vi.fn();
      window.addEventListener("keyup", onWindowKeyUp);

      fireEvent.keyDown(screen.getByTestId("room-type-list-item"), {
        key: "Enter",
      });
      fireEvent.keyUp(document.body, { key: "Enter" });

      window.removeEventListener("keyup", onWindowKeyUp);
      expect(onWindowKeyUp).toHaveBeenCalledTimes(1);
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
      expect(dropdownButton).toHaveClass(styles.isOpen);
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
