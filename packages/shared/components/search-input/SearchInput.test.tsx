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
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InputSize } from "../text-input";
import { SearchInput } from ".";

const baseProps = {
  value: "",
  size: InputSize.base,
};

describe("<SearchInput />", () => {
  it("renders without error", () => {
    render(<SearchInput {...baseProps} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(
      <SearchInput {...baseProps} size={InputSize.base} />,
    );
    expect(screen.getByTestId("text-input")).toHaveAttribute(
      "data-size",
      InputSize.base,
    );

    rerender(<SearchInput {...baseProps} size={InputSize.middle} />);
    expect(screen.getByTestId("text-input")).toHaveAttribute(
      "data-size",
      InputSize.middle,
    );

    rerender(<SearchInput {...baseProps} size={InputSize.large} />);
    expect(screen.getByTestId("text-input")).toHaveAttribute(
      "data-size",
      InputSize.large,
    );
  });

  it("handles input changes", async () => {
    const onChange = vi.fn();
    render(<SearchInput {...baseProps} onChange={onChange} />);

    const input = screen.getByTestId("text-input");
    await userEvent.type(input, "test");

    expect(input).toHaveValue("test");
  });

  it("handles auto refresh with timeout", async () => {
    const onChange = vi.fn();
    render(
      <SearchInput
        {...baseProps}
        onChange={onChange}
        autoRefresh
        refreshTimeout={500}
      />,
    );

    const input = screen.getByTestId("text-input");
    await userEvent.type(input, "test");

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith("test");
      },
      { timeout: 600 },
    );
  });

  it("handles disabled state", () => {
    render(<SearchInput {...baseProps} isDisabled />);
    expect(screen.getByTestId("text-input")).toBeDisabled();
  });

  it("accepts custom className and id", () => {
    render(
      <SearchInput {...baseProps} className="custom-class" id="custom-id" />,
    );
    const input = screen.getByTestId("search-input");

    expect(input).toHaveClass("custom-class");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("handles focus events", async () => {
    const onFocus = vi.fn();
    render(<SearchInput {...baseProps} onFocus={onFocus} />);

    const input = screen.getByTestId("text-input");
    await userEvent.click(input);

    expect(onFocus).toHaveBeenCalled();
  });

  it("shows clear button when input has value", () => {
    render(<SearchInput {...baseProps} value="test" />);
    const { container } = render(<SearchInput {...baseProps} value="test" />);
    const iconButton = container.getElementsByClassName("search-cross")[0];
    expect(iconButton).toBeInTheDocument();
  });

  it("shows clear button when showClearButton is true", () => {
    render(<SearchInput {...baseProps} showClearButton />);
    const { container } = render(
      <SearchInput {...baseProps} showClearButton />,
    );
    const iconButton = container.getElementsByClassName("search-cross")[0];
    expect(iconButton).toBeInTheDocument();
  });

  it("shows search icon by default", () => {
    render(<SearchInput {...baseProps} />);
    const { container } = render(<SearchInput {...baseProps} />);
    const iconButton = container.getElementsByClassName("search-loupe")[0];
    expect(iconButton).toBeInTheDocument();
  });

  it("updates input value when prop value changes", () => {
    const { rerender } = render(<SearchInput {...baseProps} value="initial" />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveValue("initial");

    rerender(<SearchInput {...baseProps} value="updated" />);
    expect(input).toHaveValue("updated");
  });
});
