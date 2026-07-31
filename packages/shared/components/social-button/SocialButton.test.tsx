/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";

import GoogleIcon from "PUBLIC_DIR/images/share.google.react.svg";

import { SocialButton } from "./SocialButton";
import styles from "./SocialButton.module.scss";

describe("<SocialButton />", () => {
  const defaultProps = {
    label: "Continue with Google",
    IconComponent: GoogleIcon,
  };

  it("renders without error", () => {
    render(<SocialButton {...defaultProps} />);

    expect(screen.getByTestId("social-button")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders with custom icon color", () => {
    const customColor = "#FF0000";
    render(
      <SocialButton
        {...defaultProps}
        $iconOptions={{ color: customColor }}
        style={
          {
            "--social-button-custom-icon-color": customColor,
          } as React.CSSProperties
        }
      />,
    );

    expect(screen.getByTestId("social-button")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<SocialButton {...defaultProps} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId("social-button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders in disabled state", () => {
    render(<SocialButton {...defaultProps} isDisabled />);

    const button = screen.getByTestId("social-button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(styles.disabled);
  });

  it("renders in small size", () => {
    render(<SocialButton {...defaultProps} size="small" />);

    expect(screen.getByTestId("social-button")).toHaveClass(styles.small);
  });

  it("renders in connected state", () => {
    render(<SocialButton {...defaultProps} isConnect />);

    expect(screen.getByTestId("social-button")).toHaveClass(styles.isConnect);
  });

  it("renders without hover effects", () => {
    render(<SocialButton {...defaultProps} noHover />);

    expect(screen.getByTestId("social-button")).toHaveClass(styles.noHover);
  });

  it("renders with custom data attributes", () => {
    const dataUrl = "https://example.com";
    const dataProvider = "google";

    render(
      <SocialButton
        {...defaultProps}
        data-url={dataUrl}
        data-providername={dataProvider}
      />,
    );

    const container = screen
      .getByTestId("social-button")
      .querySelector("[data-url]");
    expect(container).toHaveAttribute("data-url", dataUrl);
    expect(container).toHaveAttribute("data-providername", dataProvider);
  });

  it("renders without label", () => {
    render(<SocialButton IconComponent={GoogleIcon} />);

    expect(
      screen.queryByRole("div", { name: /Continue with Google/i }),
    ).not.toBeInTheDocument();
  });
});
