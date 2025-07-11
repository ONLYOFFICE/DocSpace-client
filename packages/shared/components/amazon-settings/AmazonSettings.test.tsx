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
import { renderWithTheme } from "../../utils/render-with-theme";

import AmazonSettings from "./AmazonSettings";
import {
  mockSelectedStorage,
  mockStorageRegions,
  mockFormSettings,
  mockErrorsFields,
} from "./mockData";
import {
  bucket,
  SERVICE_URL,
  FORCEPATH_STYLE,
  USE_HTTP,
  SSE,
  SSE_S3,
  SSE_KMS,
  filePath,
} from "./AmazonSettings.constants";

const mockT = (key: string) => key;
const mockSetRequiredFormSettings = jest.fn();
const mockSetIsThirdStorageChanged = jest.fn();
const mockAddValueInFormSettings = jest.fn();
const mockDeleteValueFormSetting = jest.fn();

const defaultProps = {
  selectedStorage: mockSelectedStorage,
  storageRegions: mockStorageRegions,
  formSettings: mockFormSettings,
  defaultRegion: "eu-central-1",
  errorsFieldsBeforeSafe: mockErrorsFields,
  isNeedFilePath: true,
  isLoading: false,
  isLoadingData: false,
  setRequiredFormSettings: mockSetRequiredFormSettings,
  setIsThirdStorageChanged: mockSetIsThirdStorageChanged,
  addValueInFormSettings: mockAddValueInFormSettings,
  deleteValueFormSetting: mockDeleteValueFormSetting,
  t: mockT,
};

describe("AmazonSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all UI elements correctly", () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    expect(screen.getByTestId("amazon-settings-wrapper")).toBeInTheDocument();

    expect(screen.getByTestId("amazon-settings-bucket")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-settings-region")).toBeInTheDocument();
    expect(
      screen.getByTestId("amazon-settings-service-url"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("amazon-settings-force-path-style"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("amazon-settings-use-http")).toBeInTheDocument();
    expect(
      screen.getByTestId("amazon-settings-sse-method"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("amazon-bucket-input")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-service-url-input")).toBeInTheDocument();
    expect(
      screen.getByTestId("amazon-force-path-style-checkbox"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("amazon-use-http-checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-file-path-input")).toBeInTheDocument();
  });

  it("initializes with required form settings", () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    expect(mockSetRequiredFormSettings).toHaveBeenCalledWith([
      bucket,
      filePath,
    ]);
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(false);
  });

  it("initializes without file path when isNeedFilePath is false", () => {
    renderWithTheme(
      <AmazonSettings {...defaultProps} isNeedFilePath={false} />,
    );

    expect(mockSetRequiredFormSettings).toHaveBeenCalledWith([bucket]);
    expect(
      screen.queryByTestId("amazon-file-path-input"),
    ).not.toBeInTheDocument();
  });

  it("handles bucket input change", async () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    const bucketInput = screen.getByTestId("amazon-bucket-input");
    fireEvent.change(bucketInput, { target: { value: "bucket text1234" } });

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(
      bucket,
      "bucket text1234",
    );
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("handles service URL input change", async () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    const serviceUrlInput = screen.getByTestId("amazon-service-url-input");
    fireEvent.change(serviceUrlInput, {
      target: { value: "custom.s3.amazonaws.com" },
    });

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(
      SERVICE_URL,
      "custom.s3.amazonaws.com",
    );
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("handles force path style checkbox change", async () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    const checkbox = screen.getByTestId("amazon-force-path-style-checkbox");
    fireEvent.click(checkbox);

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(
      FORCEPATH_STYLE,
      "false",
    );
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("handles use HTTP checkbox change", async () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    const checkbox = screen.getByTestId("amazon-use-http-checkbox");
    fireEvent.click(checkbox);

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(USE_HTTP, "true");
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("disables inputs when storage is not set", () => {
    const unsetStorage = {
      ...mockSelectedStorage,
      isSet: false,
    };

    renderWithTheme(
      <AmazonSettings {...defaultProps} selectedStorage={unsetStorage} />,
    );

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(
      screen.getByTestId("amazon-force-path-style-checkbox"),
    ).toBeDisabled();
    expect(screen.getByTestId("amazon-use-http-checkbox")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("disables inputs when loading", () => {
    renderWithTheme(<AmazonSettings {...defaultProps} isLoading />);

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("disables inputs when loading data", () => {
    renderWithTheme(<AmazonSettings {...defaultProps} isLoadingData />);

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("shows error state for inputs", () => {
    const errorsWithBucketError = {
      ...mockErrorsFields,
      [bucket]: true,
    };

    renderWithTheme(
      <AmazonSettings
        {...defaultProps}
        errorsFieldsBeforeSafe={errorsWithBucketError}
      />,
    );

    const bucketInput = screen.getByTestId("amazon-bucket-input");
    expect(bucketInput).toHaveAttribute("data-error", "true");
  });

  it("handles SSE method selection", async () => {
    renderWithTheme(<AmazonSettings {...defaultProps} />);

    const sseMethodSelect = screen.getByTestId("amazon-settings-wrapper");
    expect(sseMethodSelect).toBeInTheDocument();
  });

  it("shows SSE-S3 radio button when server-side encryption is selected", () => {
    const formSettingsWithSSE = {
      ...mockFormSettings,
      [SSE]: SSE_S3,
    };

    renderWithTheme(
      <AmazonSettings {...defaultProps} formSettings={formSettingsWithSSE} />,
    );

    expect(screen.getByTestId("amazon-sse-s3-radio")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-sse-kms-radio")).toBeInTheDocument();
  });

  it("handles SSE radio button selection", async () => {
    const formSettingsWithSSE = {
      ...mockFormSettings,
      [SSE]: SSE_S3,
    };

    renderWithTheme(
      <AmazonSettings {...defaultProps} formSettings={formSettingsWithSSE} />,
    );

    const kmsRadio = screen.getByTestId("amazon-sse-kms-radio");
    fireEvent.click(kmsRadio);

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(SSE, SSE_KMS);
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });
});
