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

import { ToggleButton } from ".";

describe("<ToggleButton />", () => {
  const defaultProps = {
    isChecked: false,
    onChange: vi.fn(),
    label: "Toggle me",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders without error", () => {
    render(<ToggleButton {...defaultProps} />);
    expect(screen.getByTestId("toggle-button")).toBeInTheDocument();
  });

  test("renders with label", () => {
    render(<ToggleButton {...defaultProps} />);
    const label = screen.getByTestId("toggle-button-label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Toggle me");
  });

  test("renders without label when not provided", () => {
    render(<ToggleButton {...defaultProps} label={undefined} />);
    expect(screen.queryByTestId("toggle-button-label")).not.toBeInTheDocument();
  });

  test("handles checked state correctly", () => {
    render(<ToggleButton {...defaultProps} isChecked />);
    const input = screen.getByTestId("toggle-button-input") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  test("calls onChange when clicked", async () => {
    const onChange = vi.fn();
    render(<ToggleButton {...defaultProps} onChange={onChange} />);

    const toggle = screen.getByTestId("toggle-button-input");
    await userEvent.click(toggle);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("respects disabled state", () => {
    render(<ToggleButton {...defaultProps} isDisabled />);
    const input = screen.getByTestId("toggle-button-input");
    expect(input).toBeDisabled();
  });

  test("prevents interaction when disabled", async () => {
    const onChange = vi.fn();
    render(<ToggleButton {...defaultProps} onChange={onChange} isDisabled />);

    const toggle = screen.getByTestId("toggle-button-input");
    await userEvent.click(toggle);

    expect(onChange).not.toHaveBeenCalled();
  });

  test("applies custom className", () => {
    render(<ToggleButton {...defaultProps} className="custom-class" />);
    const container = screen.getByTestId("toggle-button-container");
    expect(container).toHaveClass("custom-class");
  });

  test("applies custom styles", () => {
    const customStyle = { marginTop: "10px" };
    render(<ToggleButton {...defaultProps} style={customStyle} />);
    const container = screen.getByTestId("toggle-button-container");
    expect(container).toHaveStyle(customStyle);
  });

  test("sets name attribute correctly", () => {
    render(<ToggleButton {...defaultProps} name="toggle-name" />);
    const input = screen.getByTestId("toggle-button-input");
    expect(input).toHaveAttribute("name", "toggle-name");
  });

  test("applies font styling correctly", () => {
    render(<ToggleButton {...defaultProps} fontWeight={600} fontSize="16px" />);
    const label = screen.getByTestId("toggle-button-label");
    expect(label).toHaveStyle({
      fontWeight: "600",
      fontSize: "16px",
    });
  });
});
