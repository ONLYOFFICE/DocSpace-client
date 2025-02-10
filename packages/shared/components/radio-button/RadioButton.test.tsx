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
import { RadioButton } from ".";

const baseProps = {
  name: "fruits",
  value: "apple",
  label: "Sweet apple",
};

const renderComponent = (props = {}) => {
  return render(<RadioButton {...baseProps} {...props} />);
};

describe("<RadioButton />", () => {
  it("renders without error", () => {
    renderComponent();
    expect(screen.getByTestId("radio-button")).toBeInTheDocument();
    expect(screen.getByText("Sweet apple")).toBeInTheDocument();
  });

  it("handles checked state correctly", () => {
    renderComponent({ isChecked: true });

    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it("calls onClick handler when clicked and onChange is not provided", () => {
    const onClick = jest.fn();
    renderComponent({ onClick, isChecked: false });

    const radio = screen.getByRole("radio");
    fireEvent.click(radio);
    expect(onClick).toHaveBeenCalled();
  });

  it("applies disabled state correctly", () => {
    renderComponent({ isDisabled: true });

    const radio = screen.getByRole("radio") as HTMLInputElement;
    const label = screen.getByTestId("radio-button");

    expect(radio).toBeDisabled();
    expect(label).toHaveStyle({ cursor: "default" });
  });

  it("accepts and applies custom className", () => {
    const className = "custom-radio";
    renderComponent({ className });

    const label = screen.getByTestId("radio-button");
    expect(label).toHaveClass(className);
  });

  it("accepts and applies custom styles", () => {
    const customStyle = { marginTop: "10px" };
    renderComponent({ style: customStyle });

    const label = screen.getByTestId("radio-button");
    expect(label).toHaveStyle(customStyle);
  });

  it("handles orientation prop", () => {
    renderComponent({ orientation: "vertical" });
    const label = screen.getByTestId("radio-button");
    expect(label).toBeInTheDocument();
  });

  it("updates when isChecked prop changes", () => {
    const { rerender } = renderComponent({ isChecked: false });
    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(false);

    rerender(<RadioButton {...baseProps} isChecked />);
    expect(radio.checked).toBe(true);
  });

  it("has proper accessibility attributes", () => {
    const id = "test-radio";
    renderComponent({ id });

    const radio = screen.getByRole("radio");
    const label = screen.getByTestId("radio-button");

    expect(radio).toHaveAttribute("type", "radio");
    expect(label).toHaveAttribute("id", id);
  });

  it("calls onChange when provided", () => {
    const onChange = jest.fn();
    renderComponent({ onChange });

    const radio = screen.getByRole("radio");
    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalled();
  });

  it("works without handlers", () => {
    renderComponent();
    const radio = screen.getByRole("radio");

    // Should not throw error when changed without handlers
    expect(() => {
      fireEvent.change(radio);
    }).not.toThrow();
  });

  it("updates internal state when changed", () => {
    const isChecked = false;
    renderComponent({ isChecked });
    const radio = screen.getByRole("radio") as HTMLInputElement;
    expect(radio.checked).toBe(isChecked);

    fireEvent.click(radio);
    expect(radio.checked).toBe(!isChecked);
  });
});
