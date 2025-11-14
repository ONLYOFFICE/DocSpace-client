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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";

import { Bookmarks } from ".";

// Mock the CustomScrollbarsVirtualList component
vi.mock("../../../../../scrollbar", () => ({
  CustomScrollbarsVirtualList: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="custom-scrollbar">{children}</div>,
}));

describe("Bookmarks component", () => {
  const mockBookmarks = [
    { page: 1, description: "Chapter 1", level: 1, y: 100 },
    { page: 5, description: "Chapter 2", level: 1, y: 200 },
    { page: 10, description: "Chapter 3", level: 1, y: 300 },
  ];

  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bookmarks list with correct accessibility attributes", () => {
    const { getByRole } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    const list = getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("aria-label", "PDF bookmarks");
  });

  it("renders empty list when no bookmarks provided", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={[]} navigate={mockNavigate} />,
    );

    const list = getByTestId("bookmarks-list");
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });

  it("renders inside CustomScrollbarsVirtualList", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    expect(getByTestId("custom-scrollbar")).toBeInTheDocument();
  });

  it("renders bookmark items with correct data-testid attributes", () => {
    const { getByTestId } = render(
      <Bookmarks bookmarks={mockBookmarks} navigate={mockNavigate} />,
    );

    mockBookmarks.forEach((_, index) => {
      expect(getByTestId(`bookmark-item-${index}`)).toBeInTheDocument();
      expect(getByTestId(`bookmark-button-${index}`)).toBeInTheDocument();
    });
  });
});
