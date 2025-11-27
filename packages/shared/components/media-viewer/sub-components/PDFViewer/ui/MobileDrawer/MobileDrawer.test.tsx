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
