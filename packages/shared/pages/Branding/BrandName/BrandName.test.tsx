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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { DeviceType } from "@docspace/shared/enums";
import { ThemeProvider } from "../../../components/theme-provider";
import Base from "../../../themes/base";
import { BrandName } from "./index";

jest.mock("react-device-detect", () => ({
  isMobile: false,
}));

const t = jest.fn((key) => key);
const onSave = jest.fn();

const defaultProps = {
  t,
  showNotAvailable: false,
  isSettingPaid: true,
  standalone: false,
  onSave,
  isBrandNameLoaded: true,
  defaultBrandName: "Default Brand",
  brandName: "Current Brand",
  deviceType: DeviceType.desktop,
  isEqualText: false,
};

const renderComponent = (props = {}) => {
  return render(
    <ThemeProvider theme={Base}>
      <MemoryRouter>
        <BrandName {...defaultProps} {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe("BrandName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const input = screen.getByTestId("logo-text-input");
    fireEvent.change(input, { target: { value: "New Brand" } });
    expect(input).toHaveValue("New Brand");
  });

  it("calls onSave with correct data when save button is clicked", () => {
    renderComponent();
    const saveButton = screen.getByTestId("save-button");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith({
      logoText: "Current Brand",
      logo: [],
    });
  });

  it("resets to defaultBrandName when cancel button is clicked", () => {
    renderComponent();
    const input = screen.getByTestId("logo-text-input");
    const cancelButton = screen.getByTestId("cancel-button");
    fireEvent.change(input, { target: { value: "New Brand" } });
    fireEvent.click(cancelButton);
    expect(input).toHaveValue("Default Brand");
  });

  it("disables save button when text is equal to defaultBrandName", () => {
    renderComponent({ brandName: "Default Brand" });
    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toHaveClass("isDisabled");
  });

  it("shows reminder when text is different from defaultBrandName", () => {
    renderComponent();
    const input = screen.getByTestId("logo-text-input");
    fireEvent.change(input, { target: { value: "New Brand" } });
    expect(screen.getByText("YouHaveUnsavedChanges")).toBeInTheDocument();
  });

  it("disables input when isSettingPaid is false", () => {
    renderComponent({ isSettingPaid: false });
    const input = screen.getByTestId("logo-text-input");
    expect(input).toBeDisabled();
  });
});
