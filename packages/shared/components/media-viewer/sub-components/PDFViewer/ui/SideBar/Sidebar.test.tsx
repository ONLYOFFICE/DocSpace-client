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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Sidebar } from ".";
import { BookMarkType } from "../../PDFViewer.props";

// Mock SVG components
vi.mock("PUBLIC_DIR/images/view-rows.react.svg", () => {
  const DummyViewRowsIcon = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => {
    return (
      <div className={className} style={style}>
        View Rows Icon
      </div>
    );
  };
  return { default: DummyViewRowsIcon };
});

vi.mock("PUBLIC_DIR/images/view-tiles.react.svg", () => {
  const DummyViewTilesIcon = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => {
    return (
      <div className={className} style={style}>
        View Tiles Icon
      </div>
    );
  };
  return { default: DummyViewTilesIcon };
});

vi.mock("PUBLIC_DIR/images/article-show-menu.react.svg", () => {
  const DummyArticleShowMenuIcon = (props: React.ComponentProps<"div">) => {
    return <div {...props}>Article Show Menu Icon</div>;
  };
  return { default: DummyArticleShowMenuIcon };
});
// Mock classnames
vi.mock("classnames", () => {
  const dummyClassnames = (...args: string[]) => {
    const [className, conditionalClasses] = args;
    if (typeof conditionalClasses === "object") {
      return Object.entries(conditionalClasses)
        .filter(([, condition]) => condition)
        .map(([innerClassName]) => innerClassName)
        .concat(className)
        .join(" ");
    }
    return args.filter(Boolean).join(" ");
  };
  return { default: dummyClassnames };
});

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

describe("Sidebar", () => {
  const mockBookmarks: BookMarkType[] = [
    { page: 1, description: "Bookmark 1", level: 1, y: 100 },
    { page: 2, description: "Bookmark 2", level: 1, y: 200 },
  ];

  const defaultProps = {
    bookmarks: mockBookmarks,
    isPanelOpen: false,
    setIsPDFSidebarOpen: vi.fn(),
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies correct classes when panel is open", () => {
    render(<Sidebar {...defaultProps} isPanelOpen />);

    const sidebar = screen.getByTestId("pdf-sidebar");
    expect(sidebar.className).toContain("sidebarContainer");
    expect(sidebar.className).toContain("isPanelOpen");
  });

  it("closes sidebar when close button is clicked", () => {
    const setIsPDFSidebarOpen = vi.fn();
    render(
      <Sidebar {...defaultProps} setIsPDFSidebarOpen={setIsPDFSidebarOpen} />,
    );

    fireEvent.click(screen.getByTestId("close-sidebar-button"));
    expect(setIsPDFSidebarOpen).toHaveBeenCalledWith(false);
  });

  it("does not show toggle button when there are no bookmarks", () => {
    render(<Sidebar {...defaultProps} bookmarks={[]} />);

    expect(screen.queryByTestId("view-toggle-button")).not.toBeInTheDocument();
  });
});
