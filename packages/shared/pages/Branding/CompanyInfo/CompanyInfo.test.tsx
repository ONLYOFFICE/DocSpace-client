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
import { screen, fireEvent, render } from "@testing-library/react";

import { CompanyInfo } from ".";
import { DeviceType } from "../../../enums";

vi.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: vi.fn(),
}));

const defaultProps = {
  isSettingPaid: true,
  onShowExample: vi.fn(),
  companySettings: {
    address: "Test Address",
    companyName: "Test Company",
    email: "test@example.com",
    phone: "+1234567890",
    site: "https://example.com",
    isDefault: true,
    isLicensor: false,
    hideAbout: false,
  },
  displayAbout: true,
  isBrandingAvailable: true,
  onSave: vi.fn(),
  onRestore: vi.fn(),
  isLoading: false,
  companyInfoSettingsIsDefault: false,
  deviceType: DeviceType.desktop,
  licenseAgreementsUrl: "https://example.com",
  isEnterprise: true,
  logoText: "ONLYOFFICE",
  standalone: true,
  buildVersionInfo: {
    version: "",
    buildDate: "",
    docSpace: "",
    communityServer: "",
    documentServer: "",
  },
};

describe("<CompanyInfo />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<CompanyInfo {...defaultProps} />);

    expect(screen.getByText("CompanyInfoSettings")).toBeInTheDocument();
  });

  it("disables inputs when isSettingPaid is false", () => {
    render(<CompanyInfo {...defaultProps} isSettingPaid={false} />);

    const companyNameInput = screen.getByTestId(
      "company_info_settings_company_name_input",
    );
    const addressInput = screen.getByTestId(
      "company_info_settings_address_input",
    );
    const emailInput = screen.getByTestId("company_info_settings_email_input");
    const phoneInput = screen.getByTestId("company_info_settings_phone_input");
    const siteInput = screen.getByTestId("company_info_settings_site_input");

    expect(companyNameInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(phoneInput).toBeDisabled();
    expect(siteInput).toBeDisabled();
  });

  it("updates state when inputs change", () => {
    render(<CompanyInfo {...defaultProps} />);

    const companyNameInput = screen.getByTestId(
      "company_info_settings_company_name_input",
    );
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    expect(companyNameInput).toHaveValue("New Company Name");
  });

  it("calls onSave with correct parameters", () => {
    const onSave = vi.fn();
    render(<CompanyInfo {...defaultProps} onSave={onSave} />);

    const companyNameInput = screen.getByTestId(
      "company_info_settings_company_name_input",
    );
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    const saveButton = screen.getByTestId("company_info_settings_save_button");
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      defaultProps.companySettings.address,
      "New Company Name",
      defaultProps.companySettings.email,
      defaultProps.companySettings.phone,
      defaultProps.companySettings.site,
      !defaultProps.displayAbout,
    );
  });

  it("shows validation errors for invalid inputs", () => {
    render(<CompanyInfo {...defaultProps} />);

    const emailInput = screen.getByTestId("company_info_settings_email_input");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const saveButton = screen.getByTestId("company_info_settings_save_button");
    expect(saveButton).toBeDisabled();
  });

  it("enables save button only when changes are valid", () => {
    render(<CompanyInfo {...defaultProps} />);

    const saveButton = screen.getByTestId("company_info_settings_save_button");
    expect(saveButton).toBeDisabled();

    const companyNameInput = screen.getByTestId(
      "company_info_settings_company_name_input",
    );
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    expect(saveButton).not.toBeDisabled();
  });
});
