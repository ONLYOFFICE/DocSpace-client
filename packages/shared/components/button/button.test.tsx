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
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from ".";
import { ButtonSize } from "./Button.enums";

const baseProps = {
  size: ButtonSize.extraSmall,
  isDisabled: false,
  label: "OK",
  onClick: vi.fn(),
};

describe("<Button />", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<Button {...baseProps} />);
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    render(<Button {...baseProps} aria-label="Click me" />);

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(baseProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when isDisabled is true", () => {
    render(<Button {...baseProps} isDisabled aria-disabled="true" />);

    const button = screen.getByRole("button", { name: "OK" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("disabled");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("shows loading state", () => {
    render(<Button {...baseProps} isLoading aria-busy="true" />);

    const button = screen.getByRole("button", { name: "OK" });
    expect(button.className).toContain("isLoading");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders with custom className", () => {
    render(<Button {...baseProps} className="custom-class" />);
    expect(screen.getByTestId("button").className).toContain("custom-class");
  });

  it("renders with custom style", () => {
    render(<Button {...baseProps} style={{ backgroundColor: "red" }} />);
    expect(screen.getByTestId("button")).toHaveStyle({
      backgroundColor: "red",
    });
  });

  it("renders with icon", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(<Button {...baseProps} icon={icon} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it.each(Object.values(ButtonSize))("renders with size %s", (size) => {
    render(<Button {...baseProps} size={size} />);
    expect(screen.getByTestId("button")).toHaveAttribute("data-size", size);
  });

  it("renders primary button", () => {
    render(<Button {...baseProps} primary />);
    expect(screen.getByTestId("button").className).toContain("primary");
  });

  it("renders with hover state", () => {
    render(<Button {...baseProps} isHovered />);
    expect(screen.getByTestId("button").className).toContain("isHovered");
  });

  it("renders with clicked state", () => {
    render(<Button {...baseProps} isClicked />);
    expect(screen.getByTestId("button").className).toContain("isClicked");
  });

  it("renders with scale", () => {
    render(<Button {...baseProps} scale />);
    expect(screen.getByTestId("button").className).toContain("scale");
  });

  it("handles keyboard interaction", async () => {
    const user = userEvent.setup();
    render(<Button {...baseProps} />);

    const button = screen.getByTestId("button");
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard("{enter}");
    expect(baseProps.onClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(baseProps.onClick).toHaveBeenCalledTimes(2);
  });
});
