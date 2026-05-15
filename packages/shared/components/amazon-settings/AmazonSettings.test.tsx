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
const mockSetRequiredFormSettings = vi.fn();
const mockSetIsThirdStorageChanged = vi.fn();
const mockAddValueInFormSettings = vi.fn();
const mockDeleteValueFormSetting = vi.fn();

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
    vi.clearAllMocks();
  });

  it("renders all UI elements correctly", () => {
    render(<AmazonSettings {...defaultProps} />);

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
    render(<AmazonSettings {...defaultProps} />);

    expect(mockSetRequiredFormSettings).toHaveBeenCalledWith([
      bucket,
      filePath,
    ]);
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(false);
  });

  it("initializes without file path when isNeedFilePath is false", () => {
    render(<AmazonSettings {...defaultProps} isNeedFilePath={false} />);

    expect(mockSetRequiredFormSettings).toHaveBeenCalledWith([bucket]);
    expect(
      screen.queryByTestId("amazon-file-path-input"),
    ).not.toBeInTheDocument();
  });

  it("handles bucket input change", async () => {
    render(<AmazonSettings {...defaultProps} />);

    const bucketInput = screen.getByTestId("amazon-bucket-input");
    fireEvent.change(bucketInput, { target: { value: "bucket text1234" } });

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(
      bucket,
      "bucket text1234",
    );
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("handles service URL input change", async () => {
    render(<AmazonSettings {...defaultProps} />);

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
    render(<AmazonSettings {...defaultProps} />);

    const checkbox = screen.getByTestId("amazon-force-path-style-checkbox");
    fireEvent.click(checkbox);

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(
      FORCEPATH_STYLE,
      "false",
    );
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });

  it("handles use HTTP checkbox change", async () => {
    render(<AmazonSettings {...defaultProps} />);

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

    render(<AmazonSettings {...defaultProps} selectedStorage={unsetStorage} />);

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(
      screen.getByTestId("amazon-force-path-style-checkbox"),
    ).toBeDisabled();
    expect(screen.getByTestId("amazon-use-http-checkbox")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("disables inputs when loading", () => {
    render(<AmazonSettings {...defaultProps} isLoading />);

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("disables inputs when loading data", () => {
    render(<AmazonSettings {...defaultProps} isLoadingData />);

    expect(screen.getByTestId("amazon-bucket-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-service-url-input")).toBeDisabled();
    expect(screen.getByTestId("amazon-file-path-input")).toBeDisabled();
  });

  it("shows error state for inputs", () => {
    const errorsWithBucketError = {
      ...mockErrorsFields,
      [bucket]: true,
    };

    render(
      <AmazonSettings
        {...defaultProps}
        errorsFieldsBeforeSafe={errorsWithBucketError}
      />,
    );

    const bucketInput = screen.getByTestId("amazon-bucket-input");
    expect(bucketInput).toHaveAttribute("data-error", "true");
  });

  it("handles SSE method selection", async () => {
    render(<AmazonSettings {...defaultProps} />);

    const sseMethodSelect = screen.getByTestId("amazon-settings-wrapper");
    expect(sseMethodSelect).toBeInTheDocument();
  });

  it("shows SSE-S3 radio button when server-side encryption is selected", () => {
    const formSettingsWithSSE = {
      ...mockFormSettings,
      [SSE]: SSE_S3,
    };

    render(
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

    render(
      <AmazonSettings {...defaultProps} formSettings={formSettingsWithSSE} />,
    );

    const kmsRadio = screen.getByTestId("amazon-sse-kms-radio");
    fireEvent.click(kmsRadio);

    expect(mockAddValueInFormSettings).toHaveBeenCalledWith(SSE, SSE_KMS);
    expect(mockSetIsThirdStorageChanged).toHaveBeenCalledWith(true);
  });
});
