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

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { LinkWithDropdown } from "./LinkWithDropdown";

const mockData = [
  {
    key: "key1",
    label: "Button 1",
    onClick: jest.fn(),
  },
  {
    key: "key2",
    label: "Button 2",
    onClick: jest.fn(),
  },
  {
    key: "key3",
    isSeparator: true,
  },
  {
    key: "key4",
    label: "Button 3",
    onClick: jest.fn(),
  },
];

describe("LinkWithDropdown", () => {
  it("renders without error", () => {
    render(
      <LinkWithDropdown isBold data={[]}>
        Link with dropdown
      </LinkWithDropdown>,
    );

    const button = screen.getByRole("button", { name: "Link with dropdown" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-haspopup", "true");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("renders with dropdown items", () => {
    render(
      <LinkWithDropdown isBold data={mockData} id="test-dropdown">
        Link with dropdown
      </LinkWithDropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Link with dropdown" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Open dropdown
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Check dropdown container
    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveAttribute("role", "listbox");

    // Check if dropdown items are rendered
    const items = screen.getAllByTestId((testId) =>
      testId.startsWith("link_with_drop_down_"),
    );
    expect(items).toHaveLength(4); // Including separator

    // Verify menu items text content (excluding separator)
    expect(items[0]).toHaveTextContent("Button 1");
    expect(items[1]).toHaveTextContent("Button 2");
    expect(items[3]).toHaveTextContent("Button 3");

    // Verify menu item structure
    items.forEach((item) => {
      expect(item).toHaveClass("drop-down-item");
    });

    // Verify separator
    expect(items[2]).toHaveAttribute("role", "separator");
  });

  it("handles click events on dropdown items", () => {
    render(
      <LinkWithDropdown isBold data={mockData}>
        Link with dropdown
      </LinkWithDropdown>,
    );

    // Open dropdown
    const trigger = screen.getByRole("button", { name: "Link with dropdown" });
    fireEvent.click(trigger);

    // Click first button
    const firstMenuItem = screen.getByText("Button 1");
    fireEvent.click(firstMenuItem);

    // Check that the onClick handler was called
    expect(mockData[0].onClick).toHaveBeenCalled();

    // Check that the dropdown closes after clicking
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders with custom styles", () => {
    render(
      <LinkWithDropdown
        isBold
        data={mockData}
        color="red"
        fontSize="16px"
        isSemitransparent
      >
        Link with dropdown
      </LinkWithDropdown>,
    );

    const button = screen.getByRole("button", { name: "Link with dropdown" });
    expect(button).toHaveStyle({ color: "red" });
  });

  it("handles disabled state", () => {
    render(
      <LinkWithDropdown isBold data={mockData} isDisabled>
        Link with dropdown
      </LinkWithDropdown>,
    );

    const button = screen.getByRole("button", { name: "Link with dropdown" });
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("handles text overflow", () => {
    const title = "Full text of the dropdown";
    render(
      <LinkWithDropdown isBold data={mockData} isTextOverflow title={title}>
        Link with dropdown
      </LinkWithDropdown>,
    );

    const textElement = screen.getByText("Link with dropdown");
    expect(textElement).toHaveClass("textOverflow");
    expect(textElement).toHaveAttribute("title", title);
  });
});
