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
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import NavLogoReactSvgUrl from "PUBLIC_DIR/images/nav.logo.react.svg?url";

import { DropDownItem } from ".";

const baseProps = {
  isSeparator: false,
  isHeader: false,
  tabIndex: -1,
  label: "test",
  disabled: false,
  icon: NavLogoReactSvgUrl,
  noHover: false,
  onClick: vi.fn(),
};

describe("<DropDownItem />", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<DropDownItem {...baseProps} />);
    expect(screen.getByTestId("drop-down-item")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<DropDownItem {...baseProps} label="Test Item" />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(<DropDownItem {...baseProps} disabled />);
    const item = screen.getByTestId("drop-down-item");

    fireEvent.click(item);
    expect(baseProps.onClick).not.toHaveBeenCalled();
  });

  it("handles click events", () => {
    render(<DropDownItem {...baseProps} />);
    const item = screen.getByTestId("drop-down-item");

    fireEvent.click(item);
    expect(baseProps.onClick).toHaveBeenCalled();
  });

  it("handles selected item click", () => {
    const onClickSelectedItem = vi.fn();
    render(
      <DropDownItem
        {...baseProps}
        isSelected
        onClickSelectedItem={onClickSelectedItem}
      />,
    );
    const item = screen.getByTestId("drop-down-item");

    fireEvent.click(item);
    expect(onClickSelectedItem).toHaveBeenCalled();
  });

  it("renders with toggle button", () => {
    const onChange = vi.fn();
    render(
      <DropDownItem {...baseProps} withToggle checked onClick={onChange} />,
    );
    const toggle = screen.getByRole("checkbox");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders with beta badge", () => {
    render(<DropDownItem {...baseProps} isBeta />);
    const badge = screen.getByTestId("badge-text");
    expect(badge).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const className = "custom-item";
    render(<DropDownItem {...baseProps} className={className} />);
    const item = screen.getByTestId("drop-down-item");
    expect(item).toHaveClass(className);
  });

  it("applies custom styles", () => {
    const style = { backgroundColor: "red" };
    render(<DropDownItem {...baseProps} style={style} />);
    const item = screen.getByTestId("drop-down-item");
    expect(item).toHaveStyle(style);
  });

  it("renders with additional element", () => {
    const additionalElement = <div data-testid="additional">Extra</div>;
    render(
      <DropDownItem {...baseProps} additionalElement={additionalElement} />,
    );
    expect(screen.getByTestId("additional")).toBeInTheDocument();
  });
});
