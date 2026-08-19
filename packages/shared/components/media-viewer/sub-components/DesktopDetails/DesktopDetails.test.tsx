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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DesktopDetails } from ".";

describe("DesktopDetails", () => {
  const defaultProps = {
    title: "Test Title",
    onMaskClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
