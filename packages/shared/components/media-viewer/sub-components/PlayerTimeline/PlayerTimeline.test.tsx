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
