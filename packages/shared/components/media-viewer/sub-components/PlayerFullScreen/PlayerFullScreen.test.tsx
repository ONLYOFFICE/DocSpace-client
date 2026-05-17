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
import { PlayerFullScreen } from "./index";

// Mock SVG components
vi.mock("PUBLIC_DIR/images/videoplayer.exit.react.svg", () => {
  const DummyExitFullScreen = ({
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement>;
  }) => <div {...props} ref={ref} />;
  DummyExitFullScreen.displayName = "IconExitFullScreen";
  return { default: DummyExitFullScreen };
});

vi.mock("PUBLIC_DIR/images/videoplayer.full.react.svg", () => {
  const DummyFullScreen = ({
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement>;
  }) => <div {...props} ref={ref} />;
  DummyFullScreen.displayName = "IconFullScreen";
  return { default: DummyFullScreen };
});

describe("PlayerFullScreen", () => {
  const defaultProps = {
    isAudio: false,
    isFullScreen: false,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders enter full screen button when not in full screen mode", () => {
    render(<PlayerFullScreen {...defaultProps} />);

    const button = screen.getByTestId("player-fullscreen");
    expect(button).toBeInTheDocument();

    expect(button).toHaveAttribute("aria-pressed", "false");

    const icon = screen.getByTestId("enter-fullscreen-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("role", "presentation");
  });

  it("calls onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(<PlayerFullScreen {...defaultProps} onClick={onClick} />);

    const button = screen.getByTestId("player-fullscreen");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not render anything when isAudio is true", () => {
    render(<PlayerFullScreen {...defaultProps} isAudio />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
