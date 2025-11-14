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
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CheckboxProps } from "./Checkbox.types";
import { Checkbox } from ".";

const defaultProps: CheckboxProps = {
  name: "checkbox",
  isIndeterminate: false,
};

describe("<Checkbox />", () => {
  it("renders without error", () => {
    render(<Checkbox {...defaultProps} />);
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders with label", () => {
    const label = "Test Label";
    render(<Checkbox {...defaultProps} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("applies custom className and style", () => {
    const className = "custom-class";
    const style = { margin: "10px" };
    render(<Checkbox {...defaultProps} className={className} style={style} />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveClass(className);
    expect(checkbox).toHaveStyle(style);
  });

  it("handles checked state correctly", async () => {
    const handleChange = vi.fn();
    render(<Checkbox {...defaultProps} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
    expect(checkbox).toBeChecked();
  });

  it("handles disabled state correctly", async () => {
    const handleChange = vi.fn();
    render(<Checkbox {...defaultProps} isDisabled onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(handleChange).not.toHaveBeenCalled();
    expect(checkbox).toBeDisabled();
  });

  it("handles indeterminate state correctly", () => {
    render(<Checkbox {...defaultProps} isIndeterminate />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it("updates checked state when isChecked prop changes", () => {
    const { rerender } = render(
      <Checkbox {...defaultProps} isChecked={false} />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox {...defaultProps} isChecked />);
    expect(checkbox).toBeChecked();
  });

  it("displays help button when provided", () => {
    const helpButton = <button type="button">Help</button>;
    render(<Checkbox {...defaultProps} helpButton={helpButton} />);
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });

  it("maintains accessibility attributes", () => {
    const title = "Checkbox Title";
    render(<Checkbox {...defaultProps} title={title} />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("title", title);
  });

  it("prevents checkbox state change on help button click", async () => {
    const handleChange = vi.fn();
    const helpButton = <button type="button">Help</button>;

    render(
      <Checkbox
        {...defaultProps}
        onChange={handleChange}
        isChecked={false}
        helpButton={helpButton}
      />,
    );

    const helpButtonWrapper = screen.getByTestId("checkbox-help-button");
    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(helpButtonWrapper);

    expect(handleChange).not.toHaveBeenCalled();
    expect(checkbox).not.toBeChecked();
  });
});
