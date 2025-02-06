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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DesktopDetails } from ".";

describe("DesktopDetails", () => {
  const defaultProps = {
    title: "Test Title",
    onMaskClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<DesktopDetails {...defaultProps} />);

    const container = screen.getByTestId("desktop-details");
    const title = screen.getByTestId("desktop-details-title");

    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("role", "dialog");
    expect(container).toHaveAttribute("aria-labelledby", "media-viewer-title");
    expect(title).toHaveTextContent("Test Title");
  });

  it("renders with custom className", () => {
    const customClass = "custom-class";
    render(<DesktopDetails {...defaultProps} className={customClass} />);

    const container = screen.getByTestId("desktop-details");
    expect(container).toHaveClass(customClass);
  });

  it("does not render close button by default", () => {
    render(<DesktopDetails {...defaultProps} />);

    const closeButton = screen.queryByTestId("desktop-details-close");
    expect(closeButton).not.toBeInTheDocument();
  });

  it("renders close button when showCloseButton is true", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const closeButton = screen.getByTestId("desktop-details-close");
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onMaskClick when close button is clicked", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const closeButton = screen.getByTestId("desktop-details-close");
    fireEvent.click(closeButton);

    expect(defaultProps.onMaskClick).toHaveBeenCalledTimes(1);
  });

  it("has proper accessibility attributes", () => {
    render(<DesktopDetails {...defaultProps} showCloseButton />);

    const container = screen.getByTestId("desktop-details");
    const title = screen.getByTestId("desktop-details-title");

    expect(container).toHaveAttribute("role", "dialog");
    expect(container).toHaveAttribute("aria-labelledby", "media-viewer-title");
    expect(title).toHaveAttribute("id", "media-viewer-title");
  });
});
