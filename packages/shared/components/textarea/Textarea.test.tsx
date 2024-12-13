// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation and is available at http://www.gnu.org/licenses/agpl-3.0.html
//
// The AGPL license is supplemented with a special exception.
// For full license information see LICENSE.txt.
//
// All rights reserved.
//
// For any additional rights information, please contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
// street, Riga, Latvia, EU, LV-1050.
//
// You may obtain a further copy of the GNU Affero General Public License at
//
//     http://www.gnu.org/licenses/agpl-3.0.html
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Textarea } from ".";
import { renderWithTheme } from "../../utils/render-with-theme";

describe("<Textarea />", () => {
  const defaultProps = {
    placeholder: "Add comment",
    onChange: jest.fn(),
    value: "test value",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    renderWithTheme(<Textarea {...defaultProps} />);
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("accepts className and style props", () => {
    const { container } = renderWithTheme(
      <Textarea
        {...defaultProps}
        className="test-class"
        style={{ color: "red" }}
      />,
    );

    const textarea = container.querySelector(".test-class");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveStyle({ color: "red" });
  });

  it("handles value changes", async () => {
    const handleChange = jest.fn();
    renderWithTheme(<Textarea {...defaultProps} onChange={handleChange} />);

    const textarea = screen.getByTestId("textarea");
    await userEvent.type(textarea, " additional text");

    expect(handleChange).toHaveBeenCalled();
  });

  it("displays placeholder correctly", () => {
    renderWithTheme(
      <Textarea {...defaultProps} value="" placeholder="Test placeholder" />,
    );

    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    renderWithTheme(<Textarea {...defaultProps} isDisabled />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeDisabled();
  });

  it("handles readonly state", () => {
    renderWithTheme(<Textarea {...defaultProps} isReadOnly />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("readonly");
  });

  it("shows copy icon when enableCopy is true", () => {
    renderWithTheme(<Textarea {...defaultProps} enableCopy />);

    const copyIcon = screen.getByTestId("icon-button");
    expect(copyIcon).toBeInTheDocument();
  });

  it("handles JSON formatting when isJSONField is true", () => {
    const jsonValue = JSON.stringify({ test: "value" });
    renderWithTheme(
      <Textarea {...defaultProps} value={jsonValue} isJSONField />,
    );

    const textarea = screen.getByTestId("textarea");
    const expectedValue = JSON.stringify({ test: "value" }, null, 2);
    expect(textarea).toHaveValue(expectedValue);
  });

  it("applies custom font size", () => {
    const { container } = renderWithTheme(
      <Textarea {...defaultProps} fontSize={16} />,
    );

    const textarea = container.querySelector("[data-testid='textarea']");
    expect(textarea).toHaveStyle({ fontSize: "16px" });
  });

  it("applies custom height", () => {
    renderWithTheme(<Textarea {...defaultProps} heightTextArea="100px" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveStyle({ minHeight: "100px" });
  });
});
