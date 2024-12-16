// (c) Copyright Ascensio System SIA 2009-2024
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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DropDown } from ".";
import { renderWithTheme } from "../../utils/render-with-theme";

const baseProps = {
  open: false,
  directionX: "left" as const,
  directionY: "bottom" as const,
  manualWidth: "100%",
  showDisabledItems: true,
};

describe("<DropDown />", () => {
  it("renders without error", () => {
    renderWithTheme(<DropDown {...baseProps} />);
  });

  it("renders children when open", () => {
    renderWithTheme(
      <DropDown {...baseProps} open>
        <div data-testid="child">Test Content</div>
      </DropDown>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Test Content");
  });

  it("applies correct directional classes", () => {
    renderWithTheme(
      <DropDown {...baseProps} open directionY="top" directionX="right">
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("top");
    expect(dropdown).toHaveClass("right");
    expect(dropdown).not.toHaveClass("bottom");
    expect(dropdown).not.toHaveClass("left");
  });

  it("applies mobile view class when isMobileView is true", () => {
    renderWithTheme(
      <DropDown {...baseProps} open isMobileView>
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("mobileView");
  });

  it("applies maxHeight class when maxHeight prop is provided", () => {
    renderWithTheme(
      <DropDown {...baseProps} open maxHeight={200}>
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("maxHeight");
  });

  it("applies withManualWidth class when manualWidth is provided", () => {
    renderWithTheme(
      <DropDown {...baseProps} open manualWidth="200px">
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("withManualWidth");
  });

  it("applies notReady class before dropdown is ready", () => {
    renderWithTheme(
      <DropDown {...baseProps} open>
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("notReady");
  });

  it("doesn't handle click outside when enableOnClickOutside is false", () => {
    const onClose = jest.fn();
    renderWithTheme(
      <div>
        <div data-testid="outside">Outside</div>
        <DropDown {...baseProps} open clickOutsideAction={onClose}>
          <div>Content</div>
        </DropDown>
      </div>,
    );

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies custom styles correctly", () => {
    renderWithTheme(
      <DropDown
        {...baseProps}
        open
        zIndex={1000}
        maxHeight={200}
        manualWidth="300px"
        manualX="10px"
        manualY="20px"
      >
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveStyle({
      "--z-index": "1000",
      "--max-height": "200px",
      "--manual-width": "300px",
      "--manual-x": "10px",
      "--manual-y": "20px",
    });
  });

  it("doesn't handle keyboard events when enableKeyboardEvents is false", () => {
    const onClose = jest.fn();
    renderWithTheme(
      <DropDown
        {...baseProps}
        open
        enableKeyboardEvents={false}
        clickOutsideAction={onClose}
      >
        <div>Content</div>
      </DropDown>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders with custom class name", () => {
    const customClass = "custom-dropdown";
    renderWithTheme(
      <DropDown {...baseProps} open className={customClass}>
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass(customClass);
  });

  it("applies directionX styles when not disabled", () => {
    renderWithTheme(
      <DropDown {...baseProps} open directionX="right">
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("right");
  });

  it("renders virtual list with correct props", () => {
    const items = [
      { id: 1, label: "Item 1" },
      { id: 2, label: "Item 2" },
    ];

    renderWithTheme(
      <DropDown {...baseProps} open>
        {items.map((item) => (
          <div key={item.id}>{item.label}</div>
        ))}
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("handles fixed direction prop correctly", () => {
    renderWithTheme(
      <DropDown {...baseProps} open fixedDirection>
        <div>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveClass("bottom");
    expect(dropdown).toHaveClass("left");
  });

  it("updates maxHeight based on calculatedHeight", () => {
    const maxHeight = 200;
    renderWithTheme(
      <DropDown {...baseProps} open maxHeight={maxHeight}>
        <div style={{ height: "300px" }}>Content</div>
      </DropDown>,
    );

    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toHaveStyle({ height: `${maxHeight}px` });
  });

  describe("backdrop behavior", () => {
    it("doesn't render backdrop when backDrop is false", () => {
      renderWithTheme(
        <DropDown {...baseProps} open withBackdrop={false}>
          <div>Content</div>
        </DropDown>,
      );

      expect(document.querySelector(".backdrop")).not.toBeInTheDocument();
    });
  });

  describe("position calculation", () => {
    const mockViewport = (width: number, height: number) => {
      const originalGetViewport = window.innerWidth;
      const originalGetHeight = window.innerHeight;

      Object.defineProperty(window, "innerWidth", {
        value: width,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: height,
        configurable: true,
      });

      return () => {
        Object.defineProperty(window, "innerWidth", {
          value: originalGetViewport,
          configurable: true,
        });
        Object.defineProperty(window, "innerHeight", {
          value: originalGetHeight,
          configurable: true,
        });
      };
    };

    beforeEach(() => {
      jest
        .spyOn(Element.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: Element) {
          if (this.classList.contains("dropdown")) {
            return {
              width: 200,
              height: 300,
              top: 100,
              left: 50,
              right: 250,
              bottom: 400,
              x: 50,
              y: 100,
            } as DOMRect;
          }
          // Mock parent element rect
          return {
            width: 100,
            height: 50,
            top: 80,
            left: 40,
            right: 140,
            bottom: 130,
            x: 40,
            y: 80,
          } as DOMRect;
        });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("calculates correct position for bottom-left alignment", () => {
      const cleanup = mockViewport(1000, 800);

      renderWithTheme(
        <DropDown {...baseProps} open directionY="bottom" directionX="left">
          <div>Content</div>
        </DropDown>,
      );

      const dropdown = screen.getByTestId("dropdown");
      expect(dropdown).toHaveClass("bottom");
      expect(dropdown).toHaveClass("left");

      cleanup();
    });

    it("maintains fixed direction when fixedDirection is true", () => {
      const cleanup = mockViewport(1000, 300); // Small viewport height

      renderWithTheme(
        <DropDown
          {...baseProps}
          open
          directionY="bottom"
          directionX="left"
          fixedDirection
        >
          <div>Content</div>
        </DropDown>,
      );

      const dropdown = screen.getByTestId("dropdown");
      expect(dropdown).toHaveClass("bottom");
      expect(dropdown).toHaveClass("left");

      cleanup();
    });

    it("applies manual positioning when provided", () => {
      renderWithTheme(
        <DropDown {...baseProps} open manualX="100px" manualY="200px">
          <div>Content</div>
        </DropDown>,
      );

      const dropdown = screen.getByTestId("dropdown");
      expect(dropdown).toHaveStyle({
        "--manual-x": "100px",
        "--manual-y": "200px",
      });
    });
  });
});
