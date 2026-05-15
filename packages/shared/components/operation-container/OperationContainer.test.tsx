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
vi.mock("@docspace/ui-kit/components/portal-logo/PortalLogo", () => ({
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
