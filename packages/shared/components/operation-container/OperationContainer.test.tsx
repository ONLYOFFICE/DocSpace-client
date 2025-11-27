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
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import OperationContainer from "./index";
import { OperationContainerProps } from "./OperationContainer.types";

vi.mock("PUBLIC_DIR/images/downloading.react.svg", () => ({
  default: () => {
    return <div data-testid="operation-logo" />;
  },
}));

vi.mock("PUBLIC_DIR/images/downloading.dark.react.svg", () => ({
  default: () => {
    return <div data-testid="operation-logo" />;
  },
}));

// Mock portal logo component
vi.mock("../portal-logo/PortalLogo", () => ({
  default: () => {
    return <div data-testid="portal-logo" />;
  },
}));

describe("OperationContainer", () => {
  const defaultProps: OperationContainerProps = {
    authorized: false,
    title: "Test Title",
    description: "Test Description",
  };

  it("renders title and description", () => {
    render(<OperationContainer {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders OperationContainer", () => {
    render(<OperationContainer {...defaultProps} />);
    expect(screen.getByTestId("operation-container")).toBeInTheDocument();
  });

  it("renders portal logo", () => {
    render(<OperationContainer {...defaultProps} />);
    expect(screen.getByTestId("portal-logo")).toBeInTheDocument();
  });

  it("renders operation logo", () => {
    render(<OperationContainer {...defaultProps} />);
    expect(screen.getByTestId("operation-logo")).toBeInTheDocument();
  });

  it("redirects when url is provided and user is authorized", () => {
    const originalLocation = window.location;
    const mockReplace = vi.fn();
    // Mock window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { replace: mockReplace },
    });
    const testUrl = "https://test.com";
    render(<OperationContainer {...defaultProps} url={testUrl} authorized />);
    expect(mockReplace).toHaveBeenCalledWith(testUrl);
    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("does not redirect when unauthorized", () => {
    const originalLocation = window.location;
    const mockReplace = vi.fn();

    // Mock window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { replace: mockReplace },
    });

    const testUrl = "https://test.com";
    render(
      <OperationContainer {...defaultProps} url={testUrl} authorized={false} />,
    );

    expect(mockReplace).not.toHaveBeenCalled();

    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
