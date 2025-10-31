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

import { describe, it, expect, vi } from "vitest";
import { screen, render, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";
import { globalColors } from "../../themes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

describe("ColorPicker component", () => {
  const defaultProps = {
    isPickerOnly: false,
    appliedColor: globalColors.lightBlueMain,
  };

  const mockHandleChange = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByTestId("color-picker")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-hex-input")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-hex-label")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    render(
      <ColorPicker
        {...defaultProps}
        className="custom-class"
        id="custom-id"
        applyButtonLabel="Custom Apply"
        cancelButtonLabel="Custom Cancel"
        hexCodeLabel="Custom Hex"
      />,
    );

    expect(screen.getByTestId("color-picker-apply")).toHaveTextContent(
      "Custom Apply",
    );
    expect(screen.getByTestId("color-picker-cancel")).toHaveTextContent(
      "Custom Cancel",
    );
    expect(screen.getByTestId("color-picker-hex-label")).toHaveTextContent(
      "Custom Hex:",
    );
  });

  it("renders in picker-only mode", () => {
    render(<ColorPicker {...defaultProps} isPickerOnly />);

    expect(
      screen.queryByTestId("color-picker-buttons"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("color-picker-hex-container"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("color-picker-close")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-title")).toHaveTextContent(
      "Custom",
    );
  });

  it("calls handleChange when color is changed", () => {
    render(<ColorPicker {...defaultProps} handleChange={mockHandleChange} />);

    const hexInput = screen.getByTestId("color-picker-hex-input");
    fireEvent.change(hexInput, { target: { value: "#ff0000" } });

    expect(mockHandleChange).toHaveBeenCalledWith("#ff0000");
  });

  it("calls onApply with current color when Apply button is clicked", () => {
    render(
      <ColorPicker
        {...defaultProps}
        onApply={mockOnApply}
        appliedColor="#ff0000"
      />,
    );

    const applyButton = screen.getByTestId("color-picker-apply");
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith("#ff0000");
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(<ColorPicker {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByTestId("color-picker-cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when close icon is clicked", () => {
    render(
      <ColorPicker {...defaultProps} onClose={mockOnClose} isPickerOnly />,
    );

    const closeButton = screen.getByTestId("color-picker-close");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays the applied color in hex input", () => {
    const testColor = "#ff0000";
    render(<ColorPicker {...defaultProps} appliedColor={testColor} />);

    const hexInput = screen.getByTestId("color-picker-hex-input");
    expect(hexInput).toHaveValue(testColor);
  });

  it("has correct ARIA attributes", () => {
    render(<ColorPicker {...defaultProps} />);

    const colorPicker = screen.getByTestId("color-picker");
    expect(colorPicker).toHaveAttribute("role", "dialog");
    expect(colorPicker).toHaveAttribute("aria-label", "Color picker");

    const hexInput = screen.getByTestId("color-picker-hex-input");
    expect(hexInput).toHaveAttribute("aria-label", "Hex color value");

    const applyButton = screen.getByTestId("color-picker-apply");
    expect(applyButton).toHaveAttribute("aria-label", "Apply");

    const cancelButton = screen.getByTestId("color-picker-cancel");
    expect(cancelButton).toHaveAttribute("aria-label", "Cancel");
  });
});
