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
import { screen, render, fireEvent } from "@testing-library/react";

import { Slider } from "./index";

const defaultProps = {
  min: 0,
  max: 100,
  value: 50,
  onChange: vi.fn(),
};

describe("<Slider />", () => {
  it("renders without error", () => {
    render(<Slider {...defaultProps} />);
    expect(screen.getByTestId("slider")).toBeInTheDocument();
  });

  it("accepts and applies custom props", () => {
    const props = {
      id: "testId",
      className: "test-class",
      step: 5,
      withPouring: true,
      isDisabled: false,
      ...defaultProps,
    };

    render(<Slider {...props} />);
    const slider = screen.getByTestId("slider");

    expect(slider).toHaveAttribute("id", "testId");
    expect(slider).toHaveAttribute("class");
    expect(slider.className).toContain("test-class");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("value", "50");
    expect(slider).toHaveAttribute("step", "5");
  });

  it("handles value changes correctly", () => {
    render(<Slider {...defaultProps} />);

    const slider = screen.getByTestId("slider");
    fireEvent.change(slider, { target: { value: "75" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("respects disabled state", () => {
    render(<Slider {...defaultProps} isDisabled />);

    const slider = screen.getByTestId("slider");
    expect(slider).toBeDisabled();
  });

  it("applies custom dimensions", () => {
    render(
      <Slider
        {...defaultProps}
        thumbHeight="20px"
        thumbWidth="20px"
        thumbBorderWidth="2px"
        runnableTrackHeight="4px"
      />,
    );

    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });
});
