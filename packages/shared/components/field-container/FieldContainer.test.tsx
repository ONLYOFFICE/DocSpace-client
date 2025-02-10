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

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { FieldContainer } from "./FieldContainer";
import { InputSize, InputType, TextInput } from "../text-input";

describe("<FieldContainer />", () => {
  const defaultProps = {
    labelText: "Test Label:",
    labelVisible: true,
    isRequired: false,
    children: (
      <TextInput
        value=""
        onChange={() => {}}
        type={InputType.text}
        size={InputSize.base}
      />
    ),
  };

  it("renders without error", () => {
    render(<FieldContainer {...defaultProps} />);
    expect(screen.getByTestId("field-container")).toBeInTheDocument();
  });

  it("renders with correct label", () => {
    render(<FieldContainer {...defaultProps} />);
    expect(screen.getByText("Test Label:")).toBeInTheDocument();
  });

  it("renders with required attribute", () => {
    render(<FieldContainer {...defaultProps} isRequired />);
    const label = screen.getByText("Test Label:");
    expect(label).toHaveAttribute("aria-required", "true");
  });

  it("applies custom className", () => {
    const className = "custom-class";
    render(<FieldContainer {...defaultProps} className={className} />);
    expect(screen.getByTestId("field-container")).toHaveClass(className);
  });

  it("renders with custom id", () => {
    const id = "custom-id";
    render(<FieldContainer {...defaultProps} id={id} />);
    expect(screen.getByTestId("field-container")).toHaveAttribute("id", id);
  });

  it("renders tooltip when tooltipContent is provided", () => {
    const tooltipContent = "Help text";
    render(
      <FieldContainer tooltipContent={tooltipContent} {...defaultProps} />,
    );
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("renders error message when hasError is true", () => {
    const errorMessage = "This field is required";
    render(
      <FieldContainer hasError errorMessage={errorMessage} {...defaultProps} />,
    );
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("applies vertical layout when isVertical is true", () => {
    render(<FieldContainer isVertical {...defaultProps} />);
    expect(screen.getByTestId("field-container")).toHaveAttribute(
      "data-vertical",
      "true",
    );
  });

  it("hides label when labelVisible is false", () => {
    render(<FieldContainer {...defaultProps} labelVisible={false} />);
    expect(screen.queryByText("Test Label:")).not.toBeInTheDocument();
  });

  it("renders with custom maxLabelWidth", () => {
    const maxLabelWidth = "150px";
    render(<FieldContainer {...defaultProps} maxLabelWidth={maxLabelWidth} />);
    expect(screen.getByTestId("field-container")).toHaveAttribute(
      "data-label-width",
      maxLabelWidth,
    );
  });
});
