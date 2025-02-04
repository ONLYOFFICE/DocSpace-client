// (c) Copyright Ascensio System SIA 2009-2024
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
import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/react";

import GoogleIcon from "PUBLIC_DIR/images/share.google.react.svg";
import { renderWithTheme } from "../../utils/render-with-theme";

import { SocialButton } from "./SocialButton";

describe("<SocialButton />", () => {
  const defaultProps = {
    label: "Continue with Google",
    IconComponent: GoogleIcon,
  };

  it("renders without error", () => {
    renderWithTheme(<SocialButton {...defaultProps} />);

    expect(screen.getByTestId("social-button")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders with custom icon color", () => {
    const customColor = "#FF0000";
    renderWithTheme(
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
    const handleClick = jest.fn();
    renderWithTheme(<SocialButton {...defaultProps} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId("social-button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders in disabled state", () => {
    renderWithTheme(<SocialButton {...defaultProps} isDisabled />);

    const button = screen.getByTestId("social-button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled");
  });

  it("renders in small size", () => {
    renderWithTheme(<SocialButton {...defaultProps} size="small" />);

    expect(screen.getByTestId("social-button")).toHaveClass("small");
  });

  it("renders in connected state", () => {
    renderWithTheme(<SocialButton {...defaultProps} isConnect />);

    expect(screen.getByTestId("social-button")).toHaveClass("isConnect");
  });

  it("renders without hover effects", () => {
    renderWithTheme(<SocialButton {...defaultProps} noHover />);

    expect(screen.getByTestId("social-button")).toHaveClass("noHover");
  });

  it("renders with custom data attributes", () => {
    const dataUrl = "https://example.com";
    const dataProvider = "google";

    renderWithTheme(
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
    renderWithTheme(<SocialButton IconComponent={GoogleIcon} />);

    expect(
      screen.queryByRole("div", { name: /Continue with Google/i }),
    ).not.toBeInTheDocument();
  });
});
