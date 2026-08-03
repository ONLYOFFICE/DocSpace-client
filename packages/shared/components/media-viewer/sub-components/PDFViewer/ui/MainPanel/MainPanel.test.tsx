/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";

import { MainPanel } from ".";

// Mock react-device-detect
vi.mock("react-device-detect", () => ({
  isDesktop: false,
}));

interface GestureHandlers {
  onDrag?: (state: { offset: [number]; movement: [number] }) => void;
  onDragEnd?: (state: { movement: [number] }) => void;
}

// Mock use-gesture
vi.mock("@use-gesture/react", () => ({
  useGesture: (handlers: GestureHandlers) => {
    // Store handlers for testing
    // biome-ignore lint/suspicious/noExplicitAny: TODO fix
    (global as any).gestureHandlers = handlers;
  },
}));

describe("MainPanel component", () => {
  const mockProps = {
    src: "test.pdf",
    isLoading: false,
    isLastImage: false,
    isFistImage: false,
    setZoom: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    // biome-ignore lint/suspicious/noExplicitAny: TODO fix
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with left swipe
    handlers.onDragEnd?.({ movement: [-300] }); // More than width/4 (1024/4)
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it("calls onPrev when swiping right", () => {
    render(<MainPanel {...mockProps} />);
    // biome-ignore lint/suspicious/noExplicitAny: TODO fix
    const handlers = (global as any).gestureHandlers as GestureHandlers;

    // Simulate drag end with right swipe
    handlers.onDragEnd?.({ movement: [300] }); // More than width/4 (1024/4)
    expect(mockProps.onPrev).toHaveBeenCalled();
  });
});
