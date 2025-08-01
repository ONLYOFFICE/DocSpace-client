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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FloatingButton } from ".";
import { FloatingButtonIcons } from "./FloatingButton.enums";
import { renderWithTheme } from "../../utils/render-with-theme";
import { Base } from "../../themes";

describe("FloatingButton", () => {
  const defaultProps = {
    icon: FloatingButtonIcons.upload,
    percent: 5,
  };

  const theme = {
    ...Base,
  };

  const renderComponent = (ui: React.ReactNode) => {
    return renderWithTheme(ui, theme);
  };

  it("renders without crashing", () => {
    renderComponent(<FloatingButton {...defaultProps} />);
    const button = screen.getByTestId("floating-button");
    expect(button).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const className = "custom-class";
    renderComponent(<FloatingButton {...defaultProps} className={className} />);
    expect(screen.getByTestId("floating-button")).toHaveClass(className);
  });

  it("renders with custom style", () => {
    const style = { marginTop: "10px" };
    renderComponent(<FloatingButton {...defaultProps} style={style} />);
    const button = screen.getByTestId("floating-button");
    expect(button).toHaveStyle({ marginTop: "10px" });
  });

  it("handles click events", () => {
    const onClick = jest.fn();
    renderComponent(<FloatingButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByTestId("floating-button");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("displays alert when alert prop is true", () => {
    renderComponent(<FloatingButton {...defaultProps} alert />);
    const alertIcon = screen.getByTestId("floating-button-alert");
    expect(alertIcon).toBeInTheDocument();
  });

  it("shows progress indicator when percent > 0", () => {
    renderComponent(<FloatingButton {...defaultProps} />);
    const progress = screen.getByTestId("floating-button-progress");
    expect(progress).toBeInTheDocument();
  });

  it("renders different icons correctly", () => {
    Object.values(FloatingButtonIcons).forEach((icon) => {
      renderComponent(<FloatingButton {...defaultProps} icon={icon} />);

      const iconElement = screen.getByTestId(`icon-${icon}`);
      expect(iconElement).toBeInTheDocument();
    });
  });

  it("calls clearUploadedFilesHistory after close icon click", () => {
    const clearUploadedFilesHistory = jest.fn();
    renderComponent(
      <FloatingButton
        {...defaultProps}
        showCancelButton
        clearUploadedFilesHistory={clearUploadedFilesHistory}
      />,
    );

    const button = screen.getByTestId("floating-button-close-icon");
    fireEvent.click(button);

    expect(clearUploadedFilesHistory).toHaveBeenCalledTimes(1);
  });

  describe("accessibility", () => {
    it("has correct ARIA attributes", () => {
      renderComponent(<FloatingButton {...defaultProps} />);
      const button = screen.getByTestId("floating-button");

      expect(button).toHaveAttribute("data-role", "button");
      expect(button).toHaveAttribute(
        "aria-label",
        `${defaultProps.icon} button`,
      );
    });

    it("is keyboard accessible", () => {
      const onClick = jest.fn();
      renderComponent(<FloatingButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId("floating-button");
      fireEvent.keyPress(button, { key: "Enter", code: 13, charCode: 13 });

      expect(onClick).toHaveBeenCalledTimes(0);
    });
  });
});
