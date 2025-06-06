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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ButtonSize } from "../../../../../../components/button";
import { ThirdPartyStorages } from "../../../../../../enums";

import type { TTranslation } from "../../../../../../types";
import AmazonStorage from "./AmazonStorage";

jest.mock("../../../../../../components/amazon-settings", () => ({
  AmazonSettings: ({
    t,
    isNeedFilePath,
  }: {
    t: TTranslation;
    isNeedFilePath: boolean;
  }) => (
    <div data-testid="amazon-settings">
      <span>{t("Common:AmazonSettings")}</span>
      <span>{isNeedFilePath ? "FilePath" : "NoFilePath"}</span>
    </div>
  ),
  formNames: jest.fn().mockReturnValue({
    accessKey: "",
    secretKey: "",
    bucket: "",
    region: "",
  }),
}));

const defaultProps = {
  t: jest.fn((key) => key),
  isValidForm: true,
  buttonSize: ButtonSize.normal,
  isMaxProgress: true,
  isLoadingData: false,
  isNeedFilePath: true,
  isLoading: false,
  selectedStorage: {
    id: ThirdPartyStorages.AmazonId,
    isSet: true,
    title: "Amazon S3",
    properties: [
      { name: "accessKey", title: "Access Key", value: "test-key" },
      { name: "secretKey", title: "Secret Key", value: "test-secret" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
      { name: "region", title: "Region", value: "us-east-1" },
    ],
  },
  formSettings: {
    accessKey: "test-key",
    secretKey: "test-secret",
    bucket: "test-bucket",
    region: "us-east-1",
  },
  errorsFieldsBeforeSafe: {},
  defaultRegion: "us-east-1",
  storageRegions: [
    {
      displayName: "US East (N. Virginia)",
      systemName: "us-east-1",
    },
  ],
  deleteValueFormSetting: jest.fn(),
  addValueInFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setCompletedFormFields: jest.fn(),
  onMakeCopyIntoStorage: jest.fn(),
};

describe("AmazonStorage", () => {
  it("renders without errors", () => {
    render(<AmazonStorage {...defaultProps} />);
    expect(screen.getByTestId("amazon-storage")).toBeInTheDocument();
    expect(screen.getByTestId("amazon-settings")).toBeInTheDocument();
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("calls onMakeCopyIntoStorage when create copy button is clicked", () => {
    render(<AmazonStorage {...defaultProps} />);
    fireEvent.click(screen.getByText("Common:CreateCopy"));
    expect(defaultProps.onMakeCopyIntoStorage).toHaveBeenCalled();
  });

  it("disables create copy button when isValidForm is false", () => {
    render(<AmazonStorage {...defaultProps} isValidForm={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when isMaxProgress is false", () => {
    render(<AmazonStorage {...defaultProps} isMaxProgress={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when selectedStorage is not set", () => {
    render(
      <AmazonStorage
        {...defaultProps}
        selectedStorage={{
          id: ThirdPartyStorages.AmazonId,
          isSet: false,
          title: "Amazon S3",
          properties: [
            { name: "accessKey", title: "Access Key", value: "" },
            { name: "secretKey", title: "Secret Key", value: "" },
            { name: "bucket", title: "Bucket", value: "" },
            { name: "region", title: "Region", value: "" },
          ],
        }}
      />,
    );
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("calls setCompletedFormFields on mount", () => {
    render(<AmazonStorage {...defaultProps} />);
    expect(defaultProps.setCompletedFormFields).toHaveBeenCalled();
  });
});
