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
import { TabItem } from ".";

const baseProps = {
  label: "Test Tab",
  isActive: false,
  onSelect: jest.fn(),
};

describe("<TabItem />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders tab item with default props", () => {
    render(<TabItem {...baseProps} />);

    const tabItem = screen.getByTestId("tab-item");
    const tabText = screen.getByTestId("tab-item-text");

    expect(tabItem).toBeInTheDocument();
    expect(tabText).toHaveTextContent("Test Tab");
    expect(tabItem).toHaveClass("tabItem");
    expect(tabItem).not.toHaveClass("active");
    expect(tabItem).toHaveAttribute("aria-selected", "false");
  });

  test("renders tab item with active state", () => {
    render(<TabItem {...baseProps} isActive />);

    const tabItem = screen.getByTestId("tab-item");

    expect(tabItem).toBeInTheDocument();
    expect(tabItem).toHaveClass("active");
    expect(tabItem).toHaveAttribute("aria-selected", "true");
  });

  test("calls onSelect when clicked", () => {
    render(<TabItem {...baseProps} />);

    const tabItem = screen.getByTestId("tab-item");
    fireEvent.click(tabItem);

    expect(baseProps.onSelect).toHaveBeenCalledTimes(1);
  });

  test("toggles active state when clicked", () => {
    const { rerender } = render(<TabItem {...baseProps} />);

    const tabItem = screen.getByTestId("tab-item");
    expect(tabItem).not.toHaveClass("active");
    expect(tabItem).toHaveAttribute("aria-selected", "false");

    fireEvent.click(tabItem);

    // Re-render with updated isActive prop to simulate state change from parent
    rerender(<TabItem {...baseProps} isActive />);
    expect(tabItem).toHaveClass("active");
    expect(tabItem).toHaveAttribute("aria-selected", "true");
  });

  test("renders with custom className", () => {
    render(<TabItem {...baseProps} className="custom-class" />);

    const tabItem = screen.getByTestId("tab-item");
    expect(tabItem).toHaveClass("custom-class");
  });

  test("renders with React node as label", () => {
    const customLabel = <span data-testid="custom-label">Custom Label</span>;

    render(<TabItem {...baseProps} label={customLabel} />);

    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });
});
