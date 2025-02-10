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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { CompanyInfo } from ".";
import { DeviceType } from "../../../enums";
import { renderWithTheme } from "../../../utils/render-with-theme";

interface TransProps {
  t: (key: string, values?: Record<string, unknown>) => string;
  i18nKey: string;
  values?: Record<string, unknown>;
  components?: Record<string, React.ReactElement>;
  ns?: string;
  children?: React.ReactNode;
}

jest.mock("react-i18next", () => ({
  Trans: ({ t, i18nKey, values }: TransProps) => {
    return t(i18nKey, { ...values });
  },
}));

jest.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: jest.fn(),
}));

const defaultProps = {
  t: (key: string) => key,
  isSettingPaid: true,
  onShowExample: jest.fn(),
  companySettings: {
    address: "Test Address",
    companyName: "Test Company",
    email: "test@example.com",
    phone: "+1234567890",
    site: "https://example.com",
    isDefault: true,
    isLicensor: false,
  },
  onSave: jest.fn(),
  onRestore: jest.fn(),
  isLoading: false,
  companyInfoSettingsIsDefault: false,
  deviceType: DeviceType.desktop,
};

describe("<CompanyInfo />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    renderWithTheme(<CompanyInfo {...defaultProps} />);

    expect(
      screen.getByText("Settings:CompanyInfoSettings"),
    ).toBeInTheDocument();
  });

  it("disables inputs when isSettingPaid is false", () => {
    renderWithTheme(<CompanyInfo {...defaultProps} isSettingPaid={false} />);

    const companyNameInput = screen.getByTestId("company-name-input");
    const addressInput = screen.getByTestId("address-input");
    const emailInput = screen.getByTestId("email-input");
    const phoneInput = screen.getByTestId("phone-input");
    const siteInput = screen.getByTestId("site-input");

    expect(companyNameInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(phoneInput).toBeDisabled();
    expect(siteInput).toBeDisabled();
  });

  it("updates state when inputs change", () => {
    renderWithTheme(<CompanyInfo {...defaultProps} />);

    const companyNameInput = screen.getByTestId("company-name-input");
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    expect(companyNameInput).toHaveValue("New Company Name");
  });

  it("calls onSave with correct parameters", () => {
    const onSave = jest.fn();
    renderWithTheme(<CompanyInfo {...defaultProps} onSave={onSave} />);

    const companyNameInput = screen.getByTestId("company-name-input");
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    const saveButton = screen.getByTestId("save-button");
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      defaultProps.companySettings.address,
      "New Company Name",
      defaultProps.companySettings.email,
      defaultProps.companySettings.phone,
      defaultProps.companySettings.site,
    );
  });

  it("shows validation errors for invalid inputs", () => {
    renderWithTheme(<CompanyInfo {...defaultProps} />);

    const emailInput = screen.getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toBeDisabled();
  });

  it("enables save button only when changes are valid", () => {
    renderWithTheme(<CompanyInfo {...defaultProps} />);

    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toBeDisabled();

    const companyNameInput = screen.getByTestId("company-name-input");
    fireEvent.change(companyNameInput, {
      target: { value: "New Company Name" },
    });

    expect(saveButton).not.toBeDisabled();
  });
});
