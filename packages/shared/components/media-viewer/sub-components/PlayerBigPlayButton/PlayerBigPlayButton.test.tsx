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

import { PlayerBigPlayButton } from ".";
import styles from "./PlayerBigPlayButton.module.scss";

// Mock BigIconPlay SVG component
vi.mock("PUBLIC_DIR/images/media.bgplay.react.svg", () => {
  const DummyBigIconPlay = ({
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.RefObject<HTMLDivElement>;
  }) => (
    <div {...props} ref={ref}>
      Play Icon
    </div>
  );
  DummyBigIconPlay.displayName = "BigIconPlay";
  return { default: DummyBigIconPlay };
});

describe("PlayerBigPlayButton", () => {
  const defaultProps = {
    visible: true,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when visible", () => {
    render(<PlayerBigPlayButton {...defaultProps} />);

    const button = screen.getByTestId("player-big-play-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(styles.wrapper);
    expect(button).toHaveAttribute("aria-label", "Play media");

    const icon = screen.getByTestId("play-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("role", "presentation");
  });

  it("does not render when not visible", () => {
    render(<PlayerBigPlayButton {...defaultProps} visible={false} />);
    expect(
      screen.queryByTestId("player-big-play-button"),
    ).not.toBeInTheDocument();
  });

  it("prevents context menu", () => {
    render(<PlayerBigPlayButton {...defaultProps} />);

    const button = screen.getByTestId("player-big-play-button");
    const mockEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(mockEvent, "preventDefault", {
      value: vi.fn(),
    });

    fireEvent(button, mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
  });
});
