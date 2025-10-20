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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import ArticleFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import { ArticleItem } from ".";

const mockOnClick = jest.fn();
const mockOnClickBadge = jest.fn();
const mockOnDrop = jest.fn();

const baseProps = {
  icon: ArticleFolderReactSvgUrl,
  text: "Documents",
  showText: true,
  onClick: mockOnClick,
  showInitial: true,
  showBadge: true,
  isEndOfBlock: true,
  labelBadge: "2",
  onClickBadge: mockOnClickBadge,
  linkData: { path: "", state: {} },
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: MemoryRouter });
};

describe("<ArticleItem />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    renderWithRouter(<ArticleItem {...baseProps} />);
    expect(screen.getByTestId("article-item")).toBeInTheDocument();
  });

  it("displays text when showText is true", () => {
    renderWithRouter(<ArticleItem {...baseProps} />);
    expect(screen.getByText("Documents")).toBeInTheDocument();
  });

  it("hides text when showText is false", () => {
    renderWithRouter(<ArticleItem {...baseProps} showText={false} />);
    expect(screen.queryByText("Documents")).not.toBeInTheDocument();
  });

  it("shows initial letter when showInitial is true", () => {
    renderWithRouter(
      <ArticleItem {...baseProps} showInitial showText={false} />,
    );
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("displays built-in badge when showBadge is true, iconBadge and badgeComponent are not provided", () => {
    renderWithRouter(<ArticleItem {...baseProps} showBadge />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    renderWithRouter(<ArticleItem {...baseProps} />);
    const articleItemSibling = screen.getByTestId("article-item-sibling");
    await userEvent.click(articleItemSibling);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("handles badge click events", async () => {
    renderWithRouter(<ArticleItem {...baseProps} />);
    const badge = screen.getByText("2");
    await userEvent.click(badge);
    expect(mockOnClickBadge).toHaveBeenCalled();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("renders as header when isHeader is true", () => {
    renderWithRouter(<ArticleItem {...baseProps} isHeader />);
    const articleItemHeader = screen.getByTestId("article-item-header");
    expect(articleItemHeader).toBeInTheDocument();
  });

  it("handles drag and drop", () => {
    renderWithRouter(
      <ArticleItem {...baseProps} isDragging onDrop={mockOnDrop} />,
    );
    const articleItemSibling = screen.getByTestId("article-item-sibling");
    fireEvent.mouseUp(articleItemSibling);
    expect(mockOnDrop).toHaveBeenCalledWith(undefined, "Documents", undefined);
  });

  it("applies active styles when isActive is true", () => {
    renderWithRouter(<ArticleItem {...baseProps} isActive />);
    expect(screen.getByTestId("article-item")).toHaveStyle({
      backgroundColor: expect.any(String),
    });
  });

  it("renders with custom className and style", () => {
    const customStyle = { width: "200px" };
    renderWithRouter(
      <ArticleItem
        {...baseProps}
        className="custom-class"
        style={customStyle}
      />,
    );
    const articleItem = screen.getByTestId("article-item");
    expect(articleItem).toHaveClass("custom-class");
    expect(articleItem).toHaveStyle({ width: "200px" });
  });

  it("renders with custom badge component", () => {
    const CustomBadge = () => (
      <div data-testid="custom-badge">Custom Badge</div>
    );
    renderWithRouter(
      <ArticleItem {...baseProps} badgeComponent={<CustomBadge />} />,
    );
    expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
  });
});
