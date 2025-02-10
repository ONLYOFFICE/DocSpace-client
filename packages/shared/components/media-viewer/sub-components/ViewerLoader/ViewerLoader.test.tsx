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
import { ViewerLoader } from "./index";

describe("ViewerLoader", () => {
  const defaultProps = {
    isLoading: true,
    isError: false,
    withBackground: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loader when isLoading is true", () => {
    render(<ViewerLoader {...defaultProps} />);

    const loader = screen.getByTestId("viewer-loader");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("role", "progressbar");
    expect(loader).toHaveAttribute("aria-label", "Loading content");
  });

  it("does not render when isLoading is false", () => {
    render(<ViewerLoader {...defaultProps} isLoading={false} />);
    expect(screen.queryByTestId("viewer-loader")).not.toBeInTheDocument();
  });

  it("does not render when isError is true", () => {
    render(<ViewerLoader {...defaultProps} isError />);
    expect(screen.queryByTestId("viewer-loader")).not.toBeInTheDocument();
  });

  it("adds background class when withBackground is true", () => {
    render(<ViewerLoader {...defaultProps} withBackground />);
    const wrapper = screen.getByTestId("viewer-loader-wrapper");
    expect(wrapper).toHaveClass("withBackground");
  });

  it("handles click events", () => {
    render(<ViewerLoader {...defaultProps} />);
    const wrapper = screen.getByTestId("viewer-loader-wrapper");
    fireEvent.click(wrapper);
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});
