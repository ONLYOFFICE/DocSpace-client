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
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ThirdPartyStorages } from "@docspace/shared/enums";
import { renderWithTheme } from "@docspace/shared/utils/render-with-theme";

import { selectedStorages } from "../../../mockData";
import ThirdPartyStorageModule from "./ThirdPartyStorageModule";

jest.mock("@docspace/shared/components/combobox", () => ({
  ComboBox: ({
    advancedOptions,
    selectedOption,
  }: {
    advancedOptions: React.ReactNode;
    selectedOption: { key: number; label: string };
  }) => (
    <div data-testid="combo-box">
      <span>Selected: {selectedOption.label}</span>
      <div data-testid="advanced-options">{advancedOptions}</div>
    </div>
  ),
}));

jest.mock("../storages/AmazonStorage", () => ({
  AmazonStorage: () => <div data-testid="amazon-storage">Amazon Storage</div>,
}));

jest.mock("../storages/GoogleCloudStorage", () => ({
  GoogleCloudStorage: () => (
    <div data-testid="google-cloud-storage">Google Cloud Storage</div>
  ),
}));

jest.mock("../storages/RackspaceStorage", () => ({
  RackspaceStorage: () => (
    <div data-testid="rackspace-storage">Rackspace Storage</div>
  ),
}));

jest.mock("../storages/SelectelStorage", () => ({
  SelectelStorage: () => (
    <div data-testid="selectel-storage">Selectel Storage</div>
  ),
}));

const defaultProps = {
  thirdPartyStorage: [
    selectedStorages.amazon,
    selectedStorages.googleCloud,
    selectedStorages.rackspace,
    selectedStorages.selectel,
  ],
  setStorageId: jest.fn(),
  defaultStorageId: ThirdPartyStorages.AmazonId,
  selectedStorageId: ThirdPartyStorages.AmazonId,
  isLoadingData: false,
  formSettings: {},
  errorsFieldsBeforeSafe: {},
  isNeedFilePath: true,
  selectedPeriodLabel: "Every day",
  selectedWeekdayLabel: "Monday",
  selectedHour: "12:00",
  selectedMonthDay: "1",
  selectedMaxCopiesNumber: "3",
  selectedPeriodNumber: "0",
  periodsObject: [],
  weekdaysLabelArray: [],
  monthNumbersArray: [],
  hoursArray: [],
  maxNumberCopiesArray: [],
  storageRegions: [],
  defaultRegion: "us-east-1",
  setCompletedFormFields: jest.fn(),
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setMaxCopies: jest.fn(),
  setPeriod: jest.fn(),
  setWeekday: jest.fn(),
  setMonthNumber: jest.fn(),
  setTime: jest.fn(),
  deleteValueFormSetting: jest.fn(),
};

describe("ThirdPartyStorageModule", () => {
  it("renders with Amazon storage selected", () => {
    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-storage")).toBeInTheDocument();
    expect(
      screen.queryByTestId("google-cloud-storage"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("rackspace-storage")).not.toBeInTheDocument();
    expect(screen.queryByTestId("selectel-storage")).not.toBeInTheDocument();
  });

  it("renders with Google Cloud storage selected", () => {
    renderWithTheme(
      <ThirdPartyStorageModule
        {...defaultProps}
        selectedStorageId={ThirdPartyStorages.GoogleId}
      />,
    );

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
    expect(screen.queryByTestId("amazon-storage")).not.toBeInTheDocument();
    expect(screen.getByTestId("google-cloud-storage")).toBeInTheDocument();
    expect(screen.queryByTestId("rackspace-storage")).not.toBeInTheDocument();
    expect(screen.queryByTestId("selectel-storage")).not.toBeInTheDocument();
  });

  it("renders with Rackspace storage selected", () => {
    renderWithTheme(
      <ThirdPartyStorageModule
        {...defaultProps}
        selectedStorageId={ThirdPartyStorages.RackspaceId}
      />,
    );

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
    expect(screen.queryByTestId("amazon-storage")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("google-cloud-storage"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("rackspace-storage")).toBeInTheDocument();
    expect(screen.queryByTestId("selectel-storage")).not.toBeInTheDocument();
  });

  it("renders with Selectel storage selected", () => {
    renderWithTheme(
      <ThirdPartyStorageModule
        {...defaultProps}
        selectedStorageId={ThirdPartyStorages.SelectelId}
      />,
    );

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
    expect(screen.queryByTestId("amazon-storage")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("google-cloud-storage"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("rackspace-storage")).not.toBeInTheDocument();
    expect(screen.getByTestId("selectel-storage")).toBeInTheDocument();
  });

  it("renders in loading state", () => {
    renderWithTheme(
      <ThirdPartyStorageModule {...defaultProps} isLoadingData />,
    );

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
  });

  it("renders with empty storage list", () => {
    renderWithTheme(
      <ThirdPartyStorageModule {...defaultProps} thirdPartyStorage={[]} />,
    );

    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
  });
});
