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
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Label } from ".";
import { globalColors } from "../../themes";

const baseProps = {
  text: "First name:",
  title: "first name",
  htmlFor: "firstNameField",
  display: "block",
};

describe("Label Component", () => {
  test("renders without error", () => {
    render(<Label {...baseProps}>Test label</Label>);
    expect(screen.getByTestId("label")).toBeInTheDocument();
  });

  test("renders with required indicator when isRequired is true", () => {
    render(<Label {...baseProps} isRequired />);
    const label = screen.getByTestId("label");
    expect(label).toHaveTextContent("*");
  });

  test("applies error styles when error prop is true", () => {
    render(<Label {...baseProps} error />);
    const label = screen.getByTestId("label");
    expect(label).toHaveStyle({ color: globalColors.lightErrorStatus });
  });

  test("renders with custom className", () => {
    const className = "custom-label";
    render(<Label {...baseProps} className={className} />);
    expect(screen.getByTestId("label")).toHaveClass(className);
  });

  test("renders with custom style", () => {
    const customStyle = { marginBottom: "10px" };
    render(<Label {...baseProps} style={customStyle} />);
    expect(screen.getByTestId("label")).toHaveStyle(customStyle);
  });

  test("renders children correctly", () => {
    const childText = "Child content";
    render(<Label {...baseProps}>{childText}</Label>);
    expect(screen.getByTestId("label")).toHaveTextContent(childText);
  });

  test("renders with correct htmlFor attribute", () => {
    render(<Label {...baseProps} />);
    expect(screen.getByTestId("label")).toHaveAttribute(
      "for",
      baseProps.htmlFor,
    );
  });

  test("renders with correct text content", () => {
    render(<Label {...baseProps} />);
    expect(screen.getByTestId("label")).toHaveTextContent(baseProps.text);
  });

  test("renders with title attribute", () => {
    render(<Label {...baseProps} />);
    expect(screen.getByTestId("label")).toHaveAttribute(
      "title",
      baseProps.title,
    );
  });

  test("renders with truncate prop", () => {
    render(<Label {...baseProps} truncate />);
    expect(screen.getByTestId("label")).toHaveAttribute(
      "data-truncate",
      "true",
    );
  });
});
