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

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SnackBar } from "./Snackbar";
import { globalColors } from "../../themes";

describe("SnackBar", () => {
  const defaultProps = {
    text: "Test message",
    headerText: "Test header",
    btnText: "Action",
    countDownTime: 5000,
    sectionWidth: 400,
    backgroundColor: globalColors.lightToastAlert,
  };

  it("renders with required props", () => {
    render(<SnackBar {...defaultProps} />);
    expect(screen.getByTestId("snackbar-message")).toHaveTextContent(
      "Test message",
    );
    expect(screen.getByTestId("snackbar-header")).toHaveTextContent(
      "Test header",
    );
  });

  it("renders HTML content when provided", () => {
    const htmlContent = "<p>HTML content</p>";
    render(
      <SnackBar {...defaultProps} htmlContent={htmlContent} text={undefined} />,
    );
    expect(screen.getByTestId("snackbar-html-content")).toBeInTheDocument();
    expect(screen.getByTestId("snackbar-html-content")).toContainHTML(
      htmlContent,
    );
  });

  it("shows icon when showIcon is true", () => {
    render(<SnackBar {...defaultProps} showIcon />);
    expect(screen.getByTestId("snackbar-icon")).toBeInTheDocument();
  });

  it("renders close button when btnText is not provided", () => {
    render(<SnackBar {...defaultProps} btnText={undefined} />);
    expect(screen.getByRole("button")).toHaveClass("action");
  });

  it("handles click events", () => {
    const onAction = jest.fn();
    render(<SnackBar {...defaultProps} onAction={onAction} />);

    const button = screen.getByText(defaultProps.btnText);
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalled();
  });

  it("renders campaigns iframe when isCampaigns is true", () => {
    const htmlContent = "https://example.com";
    render(
      <SnackBar {...defaultProps} isCampaigns htmlContent={htmlContent} />,
    );

    const iframe = screen.getByTestId("snackbar-iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", htmlContent);
  });

  it("applies correct styles based on props", () => {
    const backgroundColor = "#ff0000";
    const textAlign = "center";

    render(
      <SnackBar
        {...defaultProps}
        backgroundColor={backgroundColor}
        textAlign={textAlign}
      />,
    );

    const container = screen.getByTestId("snackbar-container");
    expect(container).toHaveStyle({
      "--background-color": backgroundColor,
    });

    const textContainer = container.querySelector(".textContainer");
    expect(textContainer).toHaveStyle({
      "--text-align": textAlign,
    });
  });
});
