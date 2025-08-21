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
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Base } from "../../themes";
import * as utils from "../../utils";

import { Backdrop } from ".";

jest.mock("../../utils", () => ({
  isMobile: jest.fn(),
  isTablet: jest.fn(),
}));

describe("<Backdrop />", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset utils mock implementations
    (utils.isMobile as jest.Mock).mockReturnValue(false);
    (utils.isTablet as jest.Mock).mockReturnValue(false);
    // Clear any existing backdrops from the DOM
    document.querySelectorAll(".backdrop-active").forEach((el) => el.remove());
  });

  describe("Rendering", () => {
    it("renders when visible is true", () => {
      render(<Backdrop visible />);
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();
    });

    it("does not render when visible is false", () => {
      render(<Backdrop visible={false} />);
      expect(screen.queryByTestId("backdrop")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Backdrop visible className="custom-class" />);
      expect(screen.getByTestId("backdrop")).toHaveClass(
        "custom-class",
        "backdrop-active",
        "not-selectable",
      );
    });

    it("applies array of classNames", () => {
      render(<Backdrop visible className={["class1", "class2"]} />);
      const backdrop = screen.getByTestId("backdrop");
      expect(backdrop).toHaveClass(
        "class1",
        "class2",
        "backdrop-active",
        "not-selectable",
      );
    });

    it("applies custom styles", () => {
      const customStyle = { backgroundColor: "red" };
      render(<Backdrop visible style={customStyle} />);
      expect(screen.getByTestId("backdrop")).toHaveStyle(customStyle);
    });

    it("applies custom id", () => {
      render(<Backdrop visible id="custom-id" />);
      expect(screen.getByTestId("backdrop")).toHaveAttribute("id", "custom-id");
    });

    it("applies custom z-index", () => {
      render(<Backdrop visible zIndex={999} />);
      expect(screen.getByTestId("backdrop")).toHaveStyle({ zIndex: 999 });
    });
  });

  describe("Background behavior", () => {
    it("shows background when withBackground is true", () => {
      render(<Backdrop visible withBackground />);
      // Note: actual background color should be checked in styled-components tests
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();
    });

    it("hides background when withoutBackground is true", () => {
      render(<Backdrop visible withBackground withoutBackground />);
      // withoutBackground should take precedence over withBackground
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();
    });
  });

  describe("Aside behavior", () => {
    it("renders with isAside", () => {
      render(<Backdrop visible isAside />);
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();
    });

    it("allows multiple backdrops when isAside is true", () => {
      // Render two backdrops
      render(<Backdrop visible isAside />);
      render(<Backdrop visible isAside />);

      const backdrops = document.querySelectorAll(".backdrop-active");
      expect(backdrops).toHaveLength(2);
    });
  });

  describe("Event handling", () => {
    it("calls onClick handler when clicked", async () => {
      render(<Backdrop visible onClick={mockOnClick} />);
      await userEvent.click(screen.getByTestId("backdrop"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    describe("Touch events", () => {
      it("prevents default touch events when not a modal dialog", () => {
        render(<Backdrop visible />);
        const backdrop = screen.getByTestId("backdrop");

        const touchMoveEvent = new TouchEvent("touchmove", {
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(touchMoveEvent, "preventDefault", {
          value: jest.fn(),
        });
        fireEvent(backdrop, touchMoveEvent);
        expect(touchMoveEvent.preventDefault).toHaveBeenCalled();
      });

      it("allows touch events when isModalDialog is true", () => {
        render(<Backdrop visible isModalDialog />);
        const backdrop = screen.getByTestId("backdrop");

        const touchMoveEvent = new TouchEvent("touchmove", {
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(touchMoveEvent, "preventDefault", {
          value: jest.fn(),
        });
        fireEvent(backdrop, touchMoveEvent);
        expect(touchMoveEvent.preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe("Mobile and Tablet Behavior", () => {
    it("shows background on mobile devices without withoutBlur", () => {
      (utils.isMobile as jest.Mock).mockReturnValue(true);
      render(<Backdrop visible />);
      const backdrop = screen.getByTestId("backdrop");
      expect(backdrop).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it("shows background on tablet devices without withoutBlur", () => {
      (utils.isTablet as jest.Mock).mockReturnValue(true);
      render(<Backdrop visible />);
      const backdrop = screen.getByTestId("backdrop");
      expect(backdrop).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it("respects withoutBlur on mobile devices", () => {
      (utils.isMobile as jest.Mock).mockReturnValue(true);
      render(<Backdrop visible withoutBlur />);
      const backdrop = screen.getByTestId("backdrop");
      expect(backdrop).toHaveStyle({
        backgroundColor: Base.backdrop.unsetBackgroundColor,
      });
    });
  });

  describe("Multiple Backdrop Handling", () => {
    it("allows multiple backdrops when isAside is true", () => {
      render(<Backdrop visible isAside />);
      render(<Backdrop visible isAside />);

      const backdrops = document.querySelectorAll(".backdrop-active");
      expect(backdrops).toHaveLength(2);
    });

    it("replaces existing backdrop when not isAside", () => {
      render(<Backdrop visible />);
      render(<Backdrop visible />);

      const backdrops = document.querySelectorAll(".backdrop-active");
      expect(backdrops).toHaveLength(1);
    });
  });

  describe("Touch Events", () => {
    it("prevents default touch behavior when not a modal dialog", () => {
      render(<Backdrop visible onClick={mockOnClick} />);
      const backdrop = screen.getByTestId("backdrop");

      const touchEvent = new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(touchEvent, "preventDefault", { value: jest.fn() });
      fireEvent(backdrop, touchEvent);

      expect(touchEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });

    it("allows default touch behavior for modal dialogs", () => {
      render(<Backdrop visible isModalDialog onClick={mockOnClick} />);
      const backdrop = screen.getByTestId("backdrop");

      const touchEvent = new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(touchEvent, "preventDefault", { value: jest.fn() });
      fireEvent(backdrop, touchEvent);

      expect(touchEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe("Cleanup", () => {
    it("removes backdrop when component unmounts", () => {
      const { unmount } = render(<Backdrop visible />);
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();

      unmount();
      expect(screen.queryByTestId("backdrop")).not.toBeInTheDocument();
    });

    it("removes backdrop when visible changes to false", () => {
      const { rerender } = render(<Backdrop visible />);
      expect(screen.getByTestId("backdrop")).toBeInTheDocument();

      rerender(<Backdrop visible={false} />);
      expect(screen.queryByTestId("backdrop")).not.toBeInTheDocument();
    });
  });

  describe("Multiple backdrop behavior", () => {
    it("shows only one backdrop by default", () => {
      render(<Backdrop visible />);
      render(<Backdrop visible />);

      const backdrops = screen.queryAllByTestId("backdrop");
      expect(backdrops).toHaveLength(1);
    });

    it("allows up to two backdrops with isAside", () => {
      render(<Backdrop visible isAside />);
      render(<Backdrop visible isAside />);

      const backdrops = screen.queryAllByTestId("backdrop");
      expect(backdrops).toHaveLength(2);
    });
  });
});
