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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProviderComponent } from "@docspace/ui-kit/components/theme-provider";
import { Base } from "@docspace/ui-kit/providers/theme/themes";
import { BrandName } from "./index";

vi.mock("react-device-detect", () => ({
  isMobile: false,
}));

const onSave = vi.fn();

const defaultProps = {
  showNotAvailable: false,
  isSettingPaid: true,
  standalone: false,
  onSave,
  isBrandNameLoaded: true,
  defaultBrandName: "Default Brand",
  brandName: "Current Brand",
  isEqualText: false,
};

const renderComponent = (props = {}) => {
  return render(
    <ThemeProviderComponent theme={Base}>
      <MemoryRouter>
        <BrandName {...defaultProps} {...props} />
      </MemoryRouter>
    </ThemeProviderComponent>,
  );
};

describe("BrandName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it("shows NotAvailable component when showNotAvailable is true", () => {
    renderComponent({ showNotAvailable: true });
    expect(screen.getByText("NotAvailableUnderLicense")).toBeInTheDocument();
  });

  it("shows paid badge when isSettingPaid is false and not standalone", () => {
    renderComponent({ isSettingPaid: false, standalone: false });
    expect(screen.getByText("Common:Paid")).toBeInTheDocument();
  });

  it("does not show paid badge when isSettingPaid is true", () => {
    renderComponent({ isSettingPaid: true });
    expect(screen.queryByText("Common:Paid")).not.toBeInTheDocument();
  });

  it("does not show paid badge when standalone is true", () => {
    renderComponent({ standalone: true });
    expect(screen.queryByText("Common:Paid")).not.toBeInTheDocument();
  });

  it("updates brandNameWhiteLabel when input changes", () => {
    renderComponent();
    const input = screen.getByTestId("brand_name_input");
    fireEvent.change(input, { target: { value: "New Brand" } });
    expect(input).toHaveValue("New Brand");
  });

  it("calls onSave with correct data when save button is clicked", () => {
    renderComponent();
    const saveButton = screen.getByTestId("brand_name_save_button");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith({
      logoText: "Current Brand",
      logo: [],
    });
  });

  it("resets to defaultBrandName when cancel button is clicked", () => {
    renderComponent();
    const input = screen.getByTestId("brand_name_input");
    const cancelButton = screen.getByTestId("brand_name_cancel_button");
    fireEvent.change(input, { target: { value: "New Brand" } });
    fireEvent.click(cancelButton);
    expect(input).toHaveValue("Default Brand");
  });

  it("shows reminder when text is different from defaultBrandName", () => {
    renderComponent();
    const input = screen.getByTestId("brand_name_input");
    fireEvent.change(input, { target: { value: "New Brand" } });
    expect(
      screen.getByText("Common:YouHaveUnsavedChanges"),
    ).toBeInTheDocument();
  });

  it("disables input when isSettingPaid is false", () => {
    renderComponent({ isSettingPaid: false });
    const input = screen.getByTestId("brand_name_input");
    expect(input).toBeDisabled();
  });
});
