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
import { render, screen, fireEvent } from "@testing-library/react";
import { MainButton } from ".";

vi.mock("react-svg", () => ({
  ReactSVG: () => <div className="img" />,
}));

describe("<MainButton />", () => {
  const defaultProps = {
    text: "Test Button",
    model: [],
  };

  it("renders without error", () => {
    render(<MainButton {...defaultProps} />);
    expect(screen.getByTestId("main-button")).toBeInTheDocument();
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("accepts id", () => {
    render(<MainButton {...defaultProps} id="test-id" />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button).toHaveAttribute("id", "test-id");
  });

  it("accepts className", () => {
    render(<MainButton {...defaultProps} className="custom-class" />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button?.className).toContain("custom-class");
  });

  it("accepts style", () => {
    const customStyle = { backgroundColor: "red" };
    render(<MainButton {...defaultProps} style={customStyle} />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button).toHaveStyle("background-color: red");
  });

  it("renders as disabled", () => {
    render(<MainButton {...defaultProps} isDisabled />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button?.className).toContain("disabled");
  });

  it("prevents click when disabled", () => {
    const onAction = vi.fn();
    render(
      <MainButton
        {...defaultProps}
        isDisabled
        onAction={onAction}
        isDropdown={false}
      />,
    );

    const button = screen.getByText("Test Button").parentElement;
    fireEvent.click(button!);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("calls onAction when not disabled and not dropdown", () => {
    const onAction = vi.fn();
    render(
      <MainButton
        {...defaultProps}
        isDisabled={false}
        onAction={onAction}
        isDropdown={false}
      />,
    );

    const button = screen.getByText("Test Button").parentElement;
    fireEvent.click(button!);
    expect(onAction).toHaveBeenCalled();
  });

  it("renders dropdown arrow when isDropdown is true", () => {
    render(<MainButton {...defaultProps} isDropdown />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button?.className).toContain("dropdown");
  });

  it("does not render dropdown arrow when isDropdown is false", () => {
    render(<MainButton {...defaultProps} isDropdown={false} />);
    const button = screen.getByText("Test Button").parentElement;
    expect(button?.className).not.toContain("dropdown");
  });

  it("uses default text when not provided", () => {
    render(<MainButton model={[]} />);
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(<MainButton {...defaultProps} text="Custom Text" />);
    expect(screen.getByText("Custom Text")).toBeInTheDocument();
  });

  it("renders context menu when dropdown", () => {
    const model = [{ key: "item1", label: "Item 1" }];
    render(<MainButton {...defaultProps} model={model} isDropdown />);
    expect(
      screen.getByTestId("main-button").querySelector(".img"),
    ).toBeInTheDocument();
  });
});
