import "@testing-library/jest-dom";
import React from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThirdPartyStorageModule from "./ThirdPartyStorageModule";
import { BackupStorageType, ThirdPartyStorages } from "../../../../enums";
import { getOptions } from "../../../../utils/getThirdPartyStoragesOptions";
import { toastr } from "../../../../components/toast";
import { ButtonSize } from "../../../../components/button";
import { renderWithTheme } from "../../../../utils/render-with-theme";

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

jest.mock("../../../../utils/getThirdPartyStoragesOptions");
jest.mock("../../../../components/toast");

jest.mock(
  "PUBLIC_DIR/images/external.link.react.svg?url",
  () => "external-link-icon",
);

const mockThirdPartyStorage = [
  {
    id: ThirdPartyStorages.AmazonId,
    title: "Amazon S3",
    isSet: true,
    properties: [
      { name: "accessKey", title: "Access Key", value: "test-access-key" },
      { name: "secretKey", title: "Secret Key", value: "test-secret-key" },
    ],
  },
  {
    id: ThirdPartyStorages.GoogleId,
    title: "Google Cloud Storage",
    isSet: true,
    properties: [
      { name: "projectId", title: "Project ID", value: "test-project-id" },
      { name: "privateKey", title: "Private Key", value: "test-private-key" },
    ],
  },
  {
    id: ThirdPartyStorages.RackspaceId,
    title: "Rackspace Cloud Files",
    isSet: false,
    properties: [],
  },
  {
    id: ThirdPartyStorages.SelectelId,
    title: "Selectel Storage",
    isSet: false,
    properties: [],
  },
];

const mockStoragesInfo = {
  [ThirdPartyStorages.AmazonId]: {
    id: ThirdPartyStorages.AmazonId,
    title: "Amazon S3",
    isSet: true,
    properties: [
      { name: "accessKey", title: "Access Key", value: "test-access-key" },
      { name: "secretKey", title: "Secret Key", value: "test-secret-key" },
    ],
  },
  [ThirdPartyStorages.GoogleId]: {
    id: ThirdPartyStorages.GoogleId,
    title: "Google Cloud Storage",
    isSet: true,
    properties: [
      { name: "projectId", title: "Project ID", value: "test-project-id" },
      { name: "privateKey", title: "Private Key", value: "test-private-key" },
    ],
  },
  [ThirdPartyStorages.RackspaceId]: {
    id: ThirdPartyStorages.RackspaceId,
    title: "Rackspace Cloud Files",
    isSet: false,
    properties: [],
  },
  [ThirdPartyStorages.SelectelId]: {
    id: ThirdPartyStorages.SelectelId,
    title: "Selectel Storage",
    isSet: false,
    properties: [],
  },
};

const mockComboBoxOptions = [
  {
    key: ThirdPartyStorages.AmazonId,
    label: "Amazon S3",
    disabled: false,
    connected: true,
  },
  {
    key: ThirdPartyStorages.GoogleId,
    label: "Google Cloud Storage",
    disabled: false,
    connected: true,
  },
  {
    key: ThirdPartyStorages.RackspaceId,
    label: "Rackspace Cloud Files",
    disabled: false,
    connected: false,
  },
  {
    key: ThirdPartyStorages.SelectelId,
    label: "Selectel Storage",
    disabled: false,
    connected: false,
  },
];

describe("ThirdPartyStorageModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
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
    thirdPartyStorage: mockThirdPartyStorage,
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

  test("opens external link when clicking on unconnected storage", async () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
      selectedStorageTitle: "Rackspace Cloud Files",
      selectedStorageId: ThirdPartyStorages.RackspaceId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);

    const comboBox = screen.getByTestId("combobox");
    await userEvent.click(comboBox);

    // Find the dropdown item for Rackspace and click its external link button
    const dropdownItems = screen.getAllByTestId("drop-down-item");
    const rackspaceItem = dropdownItems.find(
      (item) =>
        item.getAttribute("data-third-party-key") ===
        ThirdPartyStorages.RackspaceId,
    );

    if (!rackspaceItem) {
      throw new Error("Rackspace dropdown item not found");
    }

    const externalLinkButton = within(rackspaceItem).getByTestId("icon-button");
    await userEvent.click(externalLinkButton);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(ThirdPartyStorages.RackspaceId),
      "_blank",
    );
  });

  test("changes selected storage when selecting a connected storage", async () => {
    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);

    const comboBox = screen.getByTestId("combobox");
    await userEvent.click(comboBox);

    // Find the dropdown item for Google Cloud Storage and click it
    const dropdownItems = screen.getAllByTestId("drop-down-item");
    const googleItem = dropdownItems.find(
      (item) =>
        item.getAttribute("data-third-party-key") ===
        ThirdPartyStorages.GoogleId,
    );

    if (!googleItem) {
      throw new Error("Google Cloud Storage dropdown item not found");
    }

    await userEvent.click(googleItem);

    expect(screen.getByTestId("google-cloud-storage")).toBeInTheDocument();
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
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
      selectedStorageTitle: "Amazon S3",
      selectedStorageId: ThirdPartyStorages.AmazonId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("amazon-storage")).toBeInTheDocument();
  });

  test("renders Google Cloud Storage component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
      selectedStorageTitle: "Google Cloud Storage",
      selectedStorageId: ThirdPartyStorages.GoogleId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("google-cloud-storage")).toBeInTheDocument();
  });

  test("renders Rackspace Cloud Files component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
      selectedStorageTitle: "Rackspace Cloud Files",
      selectedStorageId: ThirdPartyStorages.RackspaceId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("rackspace-storage")).toBeInTheDocument();
  });

  test("renders Selectel Storage component", () => {
    (getOptions as jest.Mock).mockReturnValue({
      comboBoxOptions: mockComboBoxOptions,
      storagesInfo: mockStoragesInfo,
      selectedStorageTitle: "Selectel Storage",
      selectedStorageId: ThirdPartyStorages.SelectelId,
    });

    renderWithTheme(<ThirdPartyStorageModule {...defaultProps} />);
    expect(screen.getByTestId("selectel-storage")).toBeInTheDocument();
  });
});
