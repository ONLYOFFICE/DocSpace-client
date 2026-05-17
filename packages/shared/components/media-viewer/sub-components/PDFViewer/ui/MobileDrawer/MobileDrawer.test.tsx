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

import { MobileDrawer } from ".";
import { BookMarkType } from "../../PDFViewer.props";

// Mock classNames
vi.mock("classnames", () => ({
  __esModule: true,
  default: (...args: unknown[]) => args.join(" "),
}));

// Mock react-spring
vi.mock("@react-spring/web", () => ({
  useSpring: () => [{ y: 0, opacity: 1 }, { start: vi.fn() }],
  config: {
    stiff: {},
    wobbly: {},
  },
  animated: {
    div: ({
      children,
      className,
      style,
      ...props
    }: React.ComponentProps<"div">) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock use-gesture
vi.mock("@use-gesture/react", () => ({
  useDrag: () => () => ({}),
}));

// Mock Bookmarks component
vi.mock("../Bookmarks", () => ({
  Bookmarks: ({
    bookmarks,
    navigate,
  }: {
    bookmarks: BookMarkType[];
    navigate: (page: number) => void;
  }) => (
    <div data-testid="bookmarks-component">
      {bookmarks.map((bookmark: BookMarkType) => (
        <div key={bookmark.page} onClick={() => navigate(bookmark.page)}>
          {bookmark.description}
        </div>
      ))}
    </div>
  ),
}));

describe("MobileDrawer", () => {
  const defaultProps = {
    bookmarks: [] as BookMarkType[],
    isOpenMobileDrawer: false,
    navigate: vi.fn(),
    setIsOpenMobileDrawer: vi.fn(),
    resizePDFThumbnail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.innerHeight
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("renders without crashing", () => {
    const { container } = render(<MobileDrawer {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("opens and closes drawer correctly", () => {
    render(<MobileDrawer {...defaultProps} isOpenMobileDrawer />);

    const drawer = screen.getByTestId("mobile-drawer");
    expect(drawer).toBeInTheDocument();

    const closeButton = screen.getByTestId("close-drawer-button");
    fireEvent.click(closeButton);
    expect(defaultProps.setIsOpenMobileDrawer).toHaveBeenCalledWith(false);
  });

  it("has correct ARIA attributes", () => {
    render(<MobileDrawer {...defaultProps} isOpenMobileDrawer />);

    const drawer = screen.getByTestId("mobile-drawer");
    expect(drawer).toHaveAttribute("aria-label", "Mobile drawer");

    const closeButton = screen.getByTestId("close-drawer-button");
    expect(closeButton).toHaveAttribute("aria-label", "Close drawer");
  });
});
