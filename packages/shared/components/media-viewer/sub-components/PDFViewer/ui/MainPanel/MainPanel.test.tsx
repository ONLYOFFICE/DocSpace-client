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
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MainPanel } from ".";

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isDesktop: false,
}));

// Mock CSS module
jest.mock("../MainPanel.module.scss", () => ({
  wrapper: "wrapper",
  content: "content",
  isDesktop: "isDesktop",
}));

interface GestureHandlers {
  onDrag?: (state: { offset: [number]; movement: [number] }) => void;
  onDragEnd?: (state: { movement: [number] }) => void;
}

// Mock use-gesture
jest.mock("@use-gesture/react", () => ({
  useGesture: (handlers: GestureHandlers) => {
    // Store handlers for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).gestureHandlers = handlers;
  },
}));

describe("MainPanel component", () => {
  const mockProps = {
    src: "test.pdf",
    isLoading: false,
    isLastImage: false,
    isFistImage: false,
    setZoom: jest.fn(),
    onPrev: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for swipe gesture tests
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it("renders with correct accessibility attributes", () => {
    const { getByTestId } = render(<MainPanel {...mockProps} />);

    const wrapper = getByTestId("main-panel-wrapper");
    const content = getByTestId("main-panel-content");

    expect(wrapper).toHaveAttribute("role", "region");
    expect(wrapper).toHaveAttribute("aria-label", "PDF viewer main panel");

    expect(content).toHaveAttribute("role", "document");
    expect(content).toHaveAttribute("aria-busy", "false");
    expect(content).toHaveAttribute("aria-label", "PDF document test.pdf");
  });

  it("updates loading state correctly", () => {
    const { getByTestId, rerender } = render(
      <MainPanel {...mockProps} isLoading />,
    );

    const content = getByTestId("main-panel-content");
    expect(content).toHaveAttribute("data-loading", "true");
    expect(content).toHaveAttribute("aria-busy", "true");

    rerender(<MainPanel {...mockProps} isLoading={false} />);
    expect(content).toHaveAttribute("data-loading", "false");
    expect(content).toHaveAttribute("aria-busy", "false");
  });

  it("calls onNext when swiping left", () => {
    render(<MainPanel {...mockProps} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with left swipe
    handlers.onDragEnd?.({ movement: [-300] }); // More than width/4 (1024/4)
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it("calls onPrev when swiping right", () => {
    render(<MainPanel {...mockProps} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with right swipe
    handlers.onDragEnd?.({ movement: [300] }); // More than width/4 (1024/4)
    expect(mockProps.onPrev).toHaveBeenCalled();
  });
});
