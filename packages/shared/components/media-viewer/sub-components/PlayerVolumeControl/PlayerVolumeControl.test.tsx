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
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerVolumeControl } from "./index";

// Mock SVG icons
vi.mock("PUBLIC_DIR/images/media.volumemax.react.svg", () => {
  const VolumeMaxIcon = () => <div>VolumeMaxIcon</div>;
  return { default: VolumeMaxIcon };
});

vi.mock("PUBLIC_DIR/images/media.volumeoff.react.svg", () => {
  const VolumeOffIcon = () => <div>VolumeOffIcon</div>;
  return { default: VolumeOffIcon };
});

vi.mock("PUBLIC_DIR/images/media.volumemin.react.svg", () => {
  const VolumeMinIcon = () => <div>VolumeMinIcon</div>;
  return { default: VolumeMinIcon };
});

describe("PlayerVolumeControl", () => {
  const defaultProps = {
    volume: 50,
    isMuted: false,
    toggleVolumeMute: vi.fn(),
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct ARIA attributes", () => {
    render(<PlayerVolumeControl {...defaultProps} />);

    const volumeControl = screen.getByTestId("player-volume-control");
    expect(volumeControl).toBeInTheDocument();
    expect(volumeControl).toHaveAttribute("role", "group");
    expect(volumeControl).toHaveAttribute("aria-label", "Volume controls");

    const muteButton = screen.getByTestId("volume-mute-button");
    expect(muteButton).toHaveAttribute("aria-label", "Mute");
    expect(muteButton).toHaveAttribute("aria-pressed", "false");

    const volumeSlider = screen.getByTestId("volume-slider");
    expect(volumeSlider).toHaveAttribute("type", "range");
    expect(volumeSlider).toHaveAttribute("aria-label", "Volume");
    expect(volumeSlider).toHaveAttribute("aria-valuemin", "0");
    expect(volumeSlider).toHaveAttribute("aria-valuemax", "100");
    expect(volumeSlider).toHaveAttribute("aria-valuenow", "50");
    expect(volumeSlider).toHaveAttribute("aria-valuetext", "50%");
  });

  it("handles volume slider changes", () => {
    render(<PlayerVolumeControl {...defaultProps} />);

    const volumeSlider = screen.getByTestId("volume-slider");
    fireEvent.change(volumeSlider, { target: { value: "75" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
    expect(volumeSlider).toHaveValue("50"); // Value doesn't change because it's controlled by parent
  });

  it("handles mute button click", () => {
    render(<PlayerVolumeControl {...defaultProps} />);

    const muteButton = screen.getByTestId("volume-mute-button");
    fireEvent.click(muteButton);

    expect(defaultProps.toggleVolumeMute).toHaveBeenCalled();
  });

  it("shows correct button state when muted", () => {
    render(<PlayerVolumeControl {...defaultProps} isMuted />);

    const muteButton = screen.getByTestId("volume-mute-button");
    expect(muteButton).toHaveAttribute("aria-label", "Unmute");
    expect(muteButton).toHaveAttribute("aria-pressed", "true");
  });
});
