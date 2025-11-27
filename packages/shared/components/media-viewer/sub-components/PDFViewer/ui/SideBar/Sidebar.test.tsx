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
