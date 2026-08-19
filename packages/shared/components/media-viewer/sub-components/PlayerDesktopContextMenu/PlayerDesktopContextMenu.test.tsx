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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlayerDesktopContextMenu } from ".";

// Mock SVG components
vi.mock("PUBLIC_DIR/images/icons/16/download.react.svg", () => {
  const DummyDownloadIcon = ({
    ref,
    ...props
  }: React.ComponentProps<"div"> & {
    ref: React.RefObject<HTMLDivElement>;
  }) => (
    <div {...props} ref={ref}>
      Download Icon
    </div>
  );
  DummyDownloadIcon.displayName = "DownloadReactSvgUrl";
  return { default: DummyDownloadIcon };
});

vi.mock("PUBLIC_DIR/images/icons/16/vertical-dots.react.svg", () => {
  const DummyMediaContextMenu = ({
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement>;
  }) => (
    <div {...props} ref={ref}>
      Media Context Menu
    </div>
  );
  DummyMediaContextMenu.displayName = "MediaContextMenu";
  return { default: DummyMediaContextMenu };
});

describe("PlayerDesktopContextMenu", () => {
  const mockContextMenu = (
    <div data-testid="context-menu">Context Menu Content</div>
  );
  const defaultProps = {
    canDownload: true,
    isPreviewFile: false,
    hideContextMenu: false,
    onDownloadClick: vi.fn(),
    generateContextMenu: vi.fn((isOpen) => (isOpen ? mockContextMenu : null)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders download button when hideContextMenu is true and canDownload is true", () => {
    render(
      <PlayerDesktopContextMenu
        {...defaultProps}
        hideContextMenu
        canDownload
      />,
    );

    const downloadButton = screen.getByTestId("download-button");
    expect(downloadButton).toBeInTheDocument();

    expect(downloadButton).toHaveAttribute("aria-label", "Download file");
  });

  it("calls onDownloadClick when download button is clicked", () => {
    const onDownloadClick = vi.fn();
    render(
      <PlayerDesktopContextMenu
        {...defaultProps}
        hideContextMenu
        canDownload
        onDownloadClick={onDownloadClick}
      />,
    );

    fireEvent.click(screen.getByTestId("download-button"));
    expect(onDownloadClick).toHaveBeenCalledTimes(1);
  });

  it("renders context menu button when hideContextMenu is false", () => {
    const generateContextMenu = vi.fn(() => mockContextMenu);
    render(
      <PlayerDesktopContextMenu
        {...defaultProps}
        generateContextMenu={generateContextMenu}
      />,
    );

    const contextMenuButton = screen.getByTestId("context-menu-button");
    expect(contextMenuButton).toBeInTheDocument();
    expect(contextMenuButton).toHaveAttribute("aria-haspopup", "menu");
    expect(contextMenuButton).toHaveAttribute("aria-expanded", "false");
    expect(contextMenuButton).toHaveAttribute(
      "aria-label",
      "Open context menu",
    );
  });

  it("does not render anything when isPreviewFile is true", () => {
    render(<PlayerDesktopContextMenu {...defaultProps} isPreviewFile />);
    expect(screen.queryByTestId("context-menu-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("download-button")).not.toBeInTheDocument();
  });

  it("does not render anything when context is null", () => {
    const generateContextMenu = vi.fn(() => null);
    render(
      <PlayerDesktopContextMenu
        {...defaultProps}
        generateContextMenu={generateContextMenu}
      />,
    );
    expect(screen.queryByTestId("context-menu-button")).not.toBeInTheDocument();
  });

  it("calls generateContextMenu with correct parameters", async () => {
    const generateContextMenu = vi.fn(() => mockContextMenu);
    render(
      <PlayerDesktopContextMenu
        {...defaultProps}
        generateContextMenu={generateContextMenu}
      />,
    );

    fireEvent.click(screen.getByTestId("context-menu-button"));
    await waitFor(() => {
      expect(generateContextMenu).toHaveBeenLastCalledWith(true, "9", "48");
    });
  });
});
