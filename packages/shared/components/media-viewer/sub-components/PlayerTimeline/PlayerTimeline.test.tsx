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
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerTimeline } from "./index";
import { PlayerTimelineRef } from "./PlayerTimeline.props";

// Mock react-device-detect
vi.mock("react-device-detect", () => ({
  isMobile: false,
  isMobileOnly: false,
  isIOS: false,
}));

describe("PlayerTimeline", () => {
  const mockClientWidth = 200;
  const defaultProps = {
    value: 50,
    duration: 300, // 5 minutes
    onChange: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: mockClientWidth,
      height: 10,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Mock clientWidth
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: mockClientWidth,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders timeline with correct ARIA attributes", () => {
    render(<PlayerTimeline {...defaultProps} />);

    const timeline = screen.getByTestId("player-timeline");
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveAttribute("role", "group");
    expect(timeline).toHaveAttribute("aria-label", "Video timeline");

    const progress = screen.getByTestId("timeline-progress");
    expect(progress).toHaveAttribute("role", "progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "50");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");

    const slider = screen.getByTestId("timeline-slider");
    expect(slider).toHaveAttribute("type", "range");
  });

  it("handles slider value changes", () => {
    render(<PlayerTimeline {...defaultProps} />);

    const slider = screen.getByTestId("timeline-slider");
    fireEvent.change(slider, { target: { value: "75" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("handles mouse enter and leave events", () => {
    render(<PlayerTimeline {...defaultProps} />);

    const timeline = screen.getByTestId("player-timeline");

    fireEvent.mouseEnter(timeline);
    expect(defaultProps.onMouseEnter).toHaveBeenCalled();

    fireEvent.mouseLeave(timeline);
    expect(defaultProps.onMouseLeave).toHaveBeenCalled();
  });

  it("updates progress through ref", () => {
    const ref = React.createRef<PlayerTimelineRef>();
    render(<PlayerTimeline {...defaultProps} ref={ref} />);

    const progress = screen.getByTestId("timeline-progress");
    ref.current?.setProgress(0.75);

    // Wait for style updates
    vi.advanceTimersByTime(0);
    expect(progress.style.width).toBe("75%");
  });

  it("shows hover progress on mouse move", () => {
    render(<PlayerTimeline {...defaultProps} />);

    const timeline = screen.getByTestId("player-timeline");

    // Move mouse to 50% of the timeline width
    fireEvent.mouseMove(timeline, {
      nativeEvent: { offsetX: mockClientWidth / 2 },
    });

    // Wait for style updates
    vi.advanceTimersByTime(0);
  });
});
