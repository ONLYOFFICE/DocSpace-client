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
import { ColorInput } from "./ColorInput";
import { globalColors } from "../../themes";
import dropdownStyles from "../drop-down/DropDown.module.scss";
import colorInputStyles from "./ColorInput.module.scss";

describe("ColorInput component", () => {
  it("renders without error", () => {
    render(<ColorInput />);
    expect(screen.getByTestId("color-input")).toBeInTheDocument();
  });

  it("uses default color when no color is provided", () => {
    render(<ColorInput />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe(globalColors.lightBlueMain.toUpperCase());
  });

  it("uses provided default color", () => {
    const testColor = "#FF0000";
    render(<ColorInput defaultColor={testColor} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe(testColor.toUpperCase());
  });

  it("calls handleChange when color is changed", () => {
    const handleChange = vi.fn();
    const newColor = "#00FF00";
    render(<ColorInput handleChange={handleChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: newColor } });
    expect(handleChange).toHaveBeenCalledWith(newColor);
  });

  it("disables input when isDisabled is true", () => {
    render(<ColorInput isDisabled />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("applies error styles when hasError is true", () => {
    render(<ColorInput hasError />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-error", "true");
  });

  it("applies warning styles when hasWarning is true", () => {
    render(<ColorInput hasWarning />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-warning", "true");
  });

  it("applies scale styles when scale prop is true", () => {
    render(<ColorInput scale />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-scale", "true");
  });

  it("applies custom className", () => {
    const customClass = "custom-class";
    render(<ColorInput className={customClass} />);
    const wrapper = screen.getByTestId("color-input");
    expect(wrapper).toHaveClass(customClass);
  });

  it("applies custom id", () => {
    const customId = "custom-id";
    render(<ColorInput id={customId} />);
    const wrapper = screen.getByTestId("color-input");
    expect(wrapper).toHaveAttribute("id", customId);
  });

  it("toggles color picker on color block click", () => {
    render(<ColorInput />);
    const wrapper = screen.getByTestId("color-input");
    const colorBlock = wrapper.querySelector(
      `.${colorInputStyles.colorBlock}`,
    ) as HTMLElement;

    // Ensure colorBlock exists
    expect(colorBlock).toBeInTheDocument();

    // Initially picker should be closed
    const dropdown = screen.getByTestId("dropdown");
    expect(dropdown).not.toHaveClass(dropdownStyles.open);

    // Open picker
    fireEvent.click(colorBlock);
    expect(dropdown).toHaveClass(dropdownStyles.open);

    // Close picker by clicking the color block again
    fireEvent.click(colorBlock);
    expect(dropdown).not.toHaveClass(dropdownStyles.open);
  });
});
