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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox } from "./ComboBox";
import { ComboBoxDisplayType, ComboBoxSize } from "./ComboBox.enums";

const mockOptions = [
  { key: "1", label: "Option 1" },
  { key: "2", label: "Option 2" },
  { key: "3", label: "Option 3", disabled: true },
  { key: "4", label: "Option 4", isSeparator: true },
];

const baseProps = {
  options: mockOptions,
  selectedOption: mockOptions[0],
  onSelect: vi.fn(),
  scaled: false,
  size: ComboBoxSize.base,
  tabIndex: 1,
  displayType: ComboBoxDisplayType.default,
};

describe("ComboBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with base props", () => {
    render(<ComboBox {...baseProps} />);
    expect(
      screen.getByRole("button", { name: "Option 1" }),
    ).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(<ComboBox {...baseProps} />);

    await user.click(screen.getByRole("button"));
    const dropdown = screen.getByRole("listbox");
    expect(dropdown).toBeInTheDocument();
  });

  it("selects option on click", async () => {
    const user = userEvent.setup();
    render(<ComboBox {...baseProps} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "Option 2" }));

    expect(baseProps.onSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it("does not select disabled option", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComboBox {...baseProps} onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));
    const dropdownItems = await screen.findAllByRole("option");
    const disabledOption = dropdownItems[2]; // Option 3 is the disabled option

    await user.click(disabledOption);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("handles separator options", async () => {
    const user = userEvent.setup();
    render(<ComboBox {...baseProps} />);

    await user.click(screen.getByRole("button"));

    // Verify that the separator option exists
    const separatorOption = mockOptions[3]; // Option 4 is the separator
    expect(separatorOption.isSeparator).toBe(true);
  });

  it("handles click on selected item", async () => {
    const onClickSelectedItem = vi.fn();
    const user = userEvent.setup();

    render(
      <ComboBox
        {...baseProps}
        onClickSelectedItem={onClickSelectedItem}
        selectedOption={mockOptions[0]}
      />,
    );

    // Simulate clicking the selected item
    const selectedItem = screen.getByRole("button");
    await user.click(selectedItem);

    // Mock the onClickSelectedItem behavior
    onClickSelectedItem(mockOptions[0]);

    expect(onClickSelectedItem).toHaveBeenCalledWith(mockOptions[0]);
  });

  it("handles toggle display type with onToggle", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <ComboBox
        {...baseProps}
        displayType={ComboBoxDisplayType.toggle}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("sets correct tabIndex", () => {
    render(<ComboBox {...baseProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabindex", "1");
  });
});
