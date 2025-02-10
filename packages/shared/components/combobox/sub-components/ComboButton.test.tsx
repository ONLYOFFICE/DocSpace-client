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
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../utils/render-with-theme";
import { ComboButton } from "./ComboButton";
import { ComboBoxSize } from "../ComboBox.enums";
import type { TCombobox, TOption } from "../ComboBox.types";

describe("ComboButton", () => {
  const baseProps = {
    selectedOption: {
      key: 1,
      label: "Test Option",
    } as TOption,
    onClick: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders without error with minimal props", () => {
    renderWithTheme(<ComboButton {...baseProps} />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();
  });

  test("handles click events", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ComboButton {...baseProps} />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    if (!button) throw new Error("Button not found");
    await user.click(button);
    expect(baseProps.onClick).toHaveBeenCalledTimes(1);
  });

  test("renders disabled state correctly", () => {
    renderWithTheme(<ComboButton {...baseProps} isDisabled />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  test("renders with different sizes", () => {
    const { rerender } = renderWithTheme(
      <ComboButton {...baseProps} size={ComboBoxSize.base} />,
    );
    expect(screen.getByText("Test Option")).toBeInTheDocument();

    rerender(<ComboButton {...baseProps} size={ComboBoxSize.middle} />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();

    rerender(<ComboButton {...baseProps} size={ComboBoxSize.content} />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();
  });

  test("renders with loading state", () => {
    renderWithTheme(<ComboButton {...baseProps} isLoading />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toBeInTheDocument();
  });

  test("renders with modern view", () => {
    renderWithTheme(<ComboButton {...baseProps} modernView />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toHaveStyle({ border: "none" });
  });

  test("renders with open state", () => {
    renderWithTheme(<ComboButton {...baseProps} isOpen />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  test("renders with plus badge", () => {
    renderWithTheme(<ComboButton {...baseProps} plusBadgeValue={5} />);
    expect(screen.getByText("+5")).toBeInTheDocument();
  });

  test("renders without border", () => {
    renderWithTheme(<ComboButton {...baseProps} noBorder />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toHaveStyle({ border: "none" });
  });

  test("renders with custom tab index", () => {
    renderWithTheme(<ComboButton {...baseProps} tabIndex={1} />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    expect(button).toHaveAttribute("tabindex", "1");
  });

  test("renders badge type correctly", () => {
    const props = {
      ...baseProps,
      type: "badge" as TCombobox,
      selectedOption: {
        key: 1,
        label: "Test Option",
        color: "#000",
        backgroundColor: "#fff",
        border: "#ccc",
      } as TOption,
    };
    renderWithTheme(<ComboButton {...props} />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();
  });

  test("renders descriptive type correctly", () => {
    const props = {
      ...baseProps,
      type: "descriptive" as TCombobox,
      selectedOption: {
        key: 1,
        label: "Test Option",
        description: "Test Description",
      } as TOption,
    };
    renderWithTheme(<ComboButton {...props} />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("renders with advanced options", () => {
    renderWithTheme(<ComboButton {...baseProps} withAdvancedOptions />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    if (!button) throw new Error("Button not found");
    const arrowIcon = button.querySelector(".combo-buttons_arrow-icon");
    expect(arrowIcon).toBeInTheDocument();
  });

  test("renders with custom icon", () => {
    const mockIcon = "test-icon.svg";
    renderWithTheme(<ComboButton {...baseProps} comboIcon={mockIcon} />);
    const button = screen.getByText("Test Option").closest(".combo-button");
    if (!button) throw new Error("Button not found");
    const expanderIcon = button.querySelector(".combo-buttons_expander-icon");
    expect(expanderIcon).toBeInTheDocument();
  });

  test("renders with scaled option", () => {
    renderWithTheme(<ComboButton {...baseProps} scaled />);
    expect(screen.getByText("Test Option")).toBeInTheDocument();
  });
});
