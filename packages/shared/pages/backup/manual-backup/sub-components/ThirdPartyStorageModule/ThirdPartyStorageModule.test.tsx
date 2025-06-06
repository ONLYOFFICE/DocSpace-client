import "@testing-library/jest-dom";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BackupStorageType, ThirdPartyStorages } from "@docspace/shared/enums";
import { getOptions } from "@docspace/shared/utils/getThirdPartyStoragesOptions";
import { toastr } from "@docspace/shared/components/toast";
import { ButtonSize } from "@docspace/shared/components/button";
import { renderWithTheme } from "@docspace/shared/utils/render-with-theme";

import { selectedStorages, mockThirdPartyAccounts } from "../../../mockData";
import ThirdPartyStorageModule from "./ThirdPartyStorageModule";

jest.mock("@docspace/shared/utils/getThirdPartyStoragesOptions");

jest.mock("@docspace/shared/components/toast");

jest.mock("../storages/GoogleCloudStorage", () => ({
  GoogleCloudStorage: jest
    .fn()
    .mockImplementation(({ onMakeCopyIntoStorage }) => (
      <div data-testid="google-cloud-storage">
        <button type="button" onClick={onMakeCopyIntoStorage}>
          Common:Backup
        </button>
      </div>
    )),
}));

jest.mock("../storages/RackspaceStorage", () => ({
  RackspaceStorage: jest
    .fn()
    .mockImplementation(({ onMakeCopyIntoStorage }) => (
      <div data-testid="rackspace-storage">
        <button type="button" onClick={onMakeCopyIntoStorage}>
          Common:Backup
        </button>
      </div>
    )),
}));

jest.mock("../storages/SelectelStorage", () => ({
  SelectelStorage: jest.fn().mockImplementation(({ onMakeCopyIntoStorage }) => (
    <div data-testid="selectel-storage">
      <button type="button" onClick={onMakeCopyIntoStorage}>
        Common:Backup
      </button>
    </div>
  )),
}));

jest.mock("../storages/AmazonStorage", () => ({
  AmazonStorage: jest.fn().mockImplementation(({ onMakeCopyIntoStorage }) => (
    <div data-testid="amazon-storage">
      <button type="button" onClick={onMakeCopyIntoStorage}>
        Common:Backup
      </button>
    </div>
  )),
}));

jest.mock(
  "PUBLIC_DIR/images/external.link.react.svg?url",
  () => "external-link-icon",
);

describe("ThirdPartyStorageModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockThirdPartyAccounts,
      storagesInfo: selectedStorages,
      selectedStorageTitle: "Amazon S3",
      selectedStorageId: ThirdPartyStorages.AmazonId,
    });

    window.open = jest.fn();
  });

  const defaultProps = {
    isValidForm: true,
    isNeedFilePath: false,
    isMaxProgress: true,
    buttonSize: ButtonSize.medium,
    thirdPartyStorage: Object.values(selectedStorages),
    formSettings: {},
    errorsFieldsBeforeSafe: {},
    defaultRegion: "us-east-1",
    storageRegions: [
      { displayName: "US East (N. Virginia)", systemName: "us-east-1" },
    ],
    isFormReady: jest.fn().mockReturnValue(true),
    onMakeCopy: jest.fn().mockResolvedValue(undefined),
    deleteValueFormSetting: jest.fn(),
    setCompletedFormFields: jest.fn(),
    addValueInFormSettings: jest.fn(),
    setRequiredFormSettings: jest.fn(),
    setIsThirdStorageChanged: jest.fn(),
  };

  test("renders without errors", () => {
    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(
      screen.getByTestId("third-party-storage-module"),
    ).toBeInTheDocument();
  });

  test("displays the selected storage component", () => {
    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("amazon-storage")).toBeInTheDocument();
  });

  test("handles make copy functionality", async () => {
    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);

    const makeCopyButton = screen.getByRole("button", {
      name: /Common:Backup/,
    });
    await userEvent.click(makeCopyButton);

    expect(defaultProps.onMakeCopy).toHaveBeenCalledWith(
      "",
      "ThirdPartyStorage",
      BackupStorageType.StorageModuleType.toString(),
      ThirdPartyStorages.AmazonId,
      "Amazon S3",
    );
  });

  test("handles error during make copy", async () => {
    const error = new Error("Test error");
    defaultProps.onMakeCopy.mockRejectedValueOnce(error);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);

    const makeCopyButton = screen.getByRole("button", {
      name: /Common:Backup/,
    });
    await userEvent.click(makeCopyButton);

    expect(toastr.error).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });

  test("renders Amazon S3 storage component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockThirdPartyAccounts,
      storagesInfo: selectedStorages,
      selectedStorageTitle: "Amazon S3",
      selectedStorageId: ThirdPartyStorages.AmazonId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("amazon-storage")).toBeInTheDocument();
  });

  test("renders Google Cloud Storage component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockThirdPartyAccounts,
      storagesInfo: selectedStorages,
      selectedStorageTitle: "Google Cloud Storage",
      selectedStorageId: ThirdPartyStorages.GoogleId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("google-cloud-storage")).toBeInTheDocument();
  });

  test("renders Rackspace Cloud Files component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockThirdPartyAccounts,
      storagesInfo: selectedStorages,
      selectedStorageTitle: "Rackspace Cloud Files",
      selectedStorageId: ThirdPartyStorages.RackspaceId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("rackspace-storage")).toBeInTheDocument();
  });

  test("renders Selectel Storage component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockThirdPartyAccounts,
      storagesInfo: selectedStorages,
      selectedStorageTitle: "Selectel Storage",
      selectedStorageId: ThirdPartyStorages.SelectelId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("selectel-storage")).toBeInTheDocument();
  });
});
