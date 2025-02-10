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
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import { InputSize, InputType } from "../text-input";
import { InputBlock } from ".";

describe("<InputBlock />", () => {
  const defaultProps = {
    value: "",
    iconName: SearchReactSvgUrl,
    onIconClick: jest.fn(),
    onChange: jest.fn(),
    size: InputSize.base,
    type: InputType.text,
  };

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("handles input interactions correctly", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onFocus = jest.fn();

    const { container } = render(
      <InputBlock
        {...defaultProps}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        data-testid="test-input"
      />,
    );

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();

    if (input) {
      fireEvent.change(input, { target: { value: "test" } });
      expect(onChange).toHaveBeenCalled();

      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalled();

      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalled();
    }
  });

  it("handles icon interactions correctly", () => {
    const onIconClick = jest.fn();

    render(
      <InputBlock
        {...defaultProps}
        onIconClick={onIconClick}
        iconColor="blue"
        hoverColor="red"
      />,
    );

    const iconButton = screen.getByTestId("icon-button-svg").closest("div");
    expect(iconButton).toBeInTheDocument();

    if (iconButton) fireEvent.click(iconButton);
    expect(onIconClick).toHaveBeenCalled();
  });

  it("handles disabled state correctly", () => {
    const { container } = render(<InputBlock {...defaultProps} isDisabled />);

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeDisabled();
    expect(screen.queryByTestId("icon-button-svg")).not.toBeInTheDocument();
  });

  it("handles error and warning states correctly", () => {
    render(<InputBlock {...defaultProps} hasError hasWarning />);

    const inputBlock = screen.getByTestId("text-input");
    expect(inputBlock).toHaveAttribute("data-error", "true");
    expect(inputBlock).toHaveAttribute("data-warning", "true");
  });

  it("handles different sizes correctly", () => {
    const sizes = [
      InputSize.base,
      InputSize.middle,
      InputSize.big,
      InputSize.huge,
    ];

    sizes.forEach((size) => {
      const { container, unmount } = render(
        <InputBlock {...defaultProps} size={size} />,
      );

      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
      unmount();
    });
  });

  it("handles password type correctly", () => {
    const { container } = render(
      <InputBlock {...defaultProps} type={InputType.password} />,
    );

    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it("handles read-only state correctly", () => {
    const { container } = render(<InputBlock {...defaultProps} isReadOnly />);

    const input = container.querySelector('input[type="text"]');
    expect(input).toHaveAttribute("readonly");
  });

  it("handles auto-focus correctly", () => {
    const { container } = render(
      <InputBlock {...defaultProps} isAutoFocussed />,
    );

    const input = container.querySelector('input[type="text"]');
    expect(input).toHaveFocus();
  });

  it("handles keyboard events correctly", () => {
    const onKeyDown = jest.fn();
    const { container } = render(
      <InputBlock {...defaultProps} onKeyDown={onKeyDown} />,
    );

    const input = container.querySelector('input[type="text"]');
    if (input) {
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      expect(onKeyDown).toHaveBeenCalled();
    }
  });

  it("handles placeholder text correctly", () => {
    const placeholder = "Enter text here";
    const { container } = render(
      <InputBlock {...defaultProps} placeholder={placeholder} />,
    );

    const input = container.querySelector('input[type="text"]');
    expect(input).toHaveAttribute("placeholder", placeholder);
  });

  it("handles maxLength correctly", () => {
    const maxLength = 10;
    const { container } = render(
      <InputBlock {...defaultProps} maxLength={maxLength} />,
    );

    const input = container.querySelector('input[type="text"]');
    expect(input).toHaveAttribute("maxLength", maxLength.toString());
  });

  it("handles custom className correctly", () => {
    const customClass = "custom-input-block";
    render(<InputBlock {...defaultProps} className={customClass} />);

    const inputBlock = screen.getByTestId("input-block");
    expect(inputBlock).toHaveClass(customClass);
  });

  it("handles custom styles correctly", () => {
    const customStyle = { width: "300px", margin: "10px" };
    render(<InputBlock {...defaultProps} style={customStyle} />);

    const inputBlock = screen.getByTestId("input-block");
    expect(inputBlock).toHaveStyle(customStyle);
  });
});
