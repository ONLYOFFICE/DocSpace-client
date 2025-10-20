import React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { BackupStorageType, DeviceType, FolderType } from "../../../enums";
import { ButtonSize } from "../../../components/button";
import { startBackup } from "../../../api/portal";
import SocketHelper from "../../../utils/socket";

import ManualBackup from "./index";
import { selectedStorages, mockThirdPartyAccounts } from "../mockData";

jest.mock("@docspace/shared/api/portal", () => ({
  startBackup: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@docspace/shared/components/toast", () => ({
  toastr: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@docspace/shared/utils/socket", () => ({
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock("./sub-components/RoomsModule", () => ({
  RoomsModule: jest.fn().mockImplementation(({ onMakeCopy }) => (
    <div data-testid="rooms-module">
      <button
        type="button"
        onClick={() => onMakeCopy("folder-id", "Documents", "0")}
      >
        Common:CreateCopy
      </button>
    </div>
  )),
}));

jest.mock("./sub-components/ThirdPartyModule", () => ({
  ThirdPartyModule: jest.fn().mockImplementation(({ onMakeCopy }) => (
    <div data-testid="third-party-module">
      <button
        type="button"
        onClick={() => onMakeCopy("account-id", "ThirdPartyResource", "1")}
      >
        Common:Backup
      </button>
    </div>
  )),
}));

jest.mock("./sub-components/ThirdPartyStorageModule", () => ({
  ThirdPartyStorageModule: jest.fn().mockImplementation(({ onMakeCopy }) => (
    <div data-testid="third-party-storage-module">
      <button
        type="button"
        onClick={() =>
          onMakeCopy("", "ThirdPartyStorage", "2", "amazon-id", "Amazon S3")
        }
      >
        Common:Backup
      </button>
    </div>
  )),
}));

const localStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

Object.defineProperty(window, "localStorage", { value: localStorageMock() });
Object.defineProperty(window, "location", {
  value: {
    origin: "https://example.com",
  },
});

window.open = jest.fn();

describe("ManualBackup", () => {
  const defaultProps = {
    isInitialLoading: false,
    buttonSize: ButtonSize.normal,
    temporaryLink: "",
    dataBackupUrl: "https://example.com/help/backup",
    pageIsDisabled: false,
    isNotPaidPeriod: false,
    rootFoldersTitles: {
      [FolderType.USER]: { title: "My Documents" },
    },
    currentColorScheme: {
      id: 1,
      main: {
        accent: "#333",
        buttons: "#333",
      },
      name: "name",
      text: {
        accent: "#fff",
        buttons: "#fff",
      },
    },
    downloadingProgress: 100,
    isBackupProgressVisible: false,
    isEmptyContentBeforeLoader: false,
    basePath: "/",
    isErrorPath: false,
    newPath: "",
    providers: [],
    accounts: [],
    selectedThirdPartyAccount: null,
    setBasePath: jest.fn(),
    setNewPath: jest.fn(),
    settingsFileSelector: {
      getIcon: jest.fn(),
    },
    toDefault: jest.fn(),
    isFormReady: jest.fn().mockReturnValue(true),
    currentDeviceType: DeviceType.desktop,
    maxWidth: "500px",
    removeItem: mockThirdPartyAccounts[0],
    isValidForm: true,
    deleteThirdPartyDialogVisible: false,
    connectDialogVisible: false,
    isTheSameThirdPartyAccount: false,
    connectedThirdPartyAccount: null,
    isNeedFilePath: false,
    thirdPartyStorage: Object.values(selectedStorages),
    formSettings: {},
    errorsFieldsBeforeSafe: {},
    defaultRegion: "us-east-1",
    storageRegions: [
      { systemName: "us-east-1", displayName: "US East (N. Virginia)" },
    ],
    setThirdPartyProviders: jest.fn(),
    deleteThirdParty: jest.fn(),
    setThirdPartyAccountsInfo: jest.fn(),
    setSelectedThirdPartyAccount: jest.fn(),
    setDeleteThirdPartyDialogVisible: jest.fn(),
    openConnectWindow: jest.fn(),
    deleteValueFormSetting: jest.fn(),
    setRequiredFormSettings: jest.fn(),
    addValueInFormSettings: jest.fn(),
    setCompletedFormFields: jest.fn(),
    setTemporaryLink: jest.fn(),
    getStorageParams: jest.fn(),
    clearLocalStorage: jest.fn(),
    saveToLocalStorage: jest.fn(),
    setDownloadingProgress: jest.fn(),
    setConnectedThirdPartyAccount: jest.fn(),
    setConnectDialogVisible: jest.fn(),
    setIsThirdStorageChanged: jest.fn(),

    errorInformation: "",
    backupProgressError: "",
    setBackupProgressError: jest.fn(),
    setIsBackupProgressVisible: jest.fn(),
    isThirdPartyAvailable: true,
    isPayer: false,
    walletCustomerEmail: "test@example.com",
    backupServicePrice: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<ManualBackup {...defaultProps} />);

    expect(
      screen.getByText("Common:ManualBackupDescription"),
    ).toBeInTheDocument();
    expect(screen.getByText("Common:LearnMore")).toBeInTheDocument();
    expect(screen.getByText("Common:TemporaryStorage")).toBeInTheDocument();
    expect(screen.getByText("Common:RoomsModule")).toBeInTheDocument();
    expect(screen.getByText("Common:ThirdPartyResource")).toBeInTheDocument();
    expect(screen.getByText("Common:ThirdPartyStorage")).toBeInTheDocument();
  });

  it("shows loader when isInitialLoading is true", () => {
    render(<ManualBackup {...defaultProps} isInitialLoading />);

    expect(screen.getByTestId("data-backup-loader")).toBeInTheDocument();
  });

  it("returns null when isEmptyContentBeforeLoader is true and isInitialLoading is false", () => {
    const { container } = render(
      <ManualBackup
        {...defaultProps}
        isEmptyContentBeforeLoader
        isInitialLoading={false}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows temporary storage by default and allows creating backup", async () => {
    render(<ManualBackup {...defaultProps} />);

    const temporaryRadio = screen.getByLabelText("Common:TemporaryStorage");
    expect(temporaryRadio).toBeChecked();

    const createButton = screen.getByText("Common:Create");
    expect(createButton).toBeInTheDocument();

    await userEvent.click(createButton);

    expect(startBackup).toHaveBeenCalledWith(
      `${BackupStorageType.TemporaryModuleType}`,
      null,
      false,
      false,
    );

    expect(defaultProps.setDownloadingProgress).toHaveBeenCalledWith(1);
    expect(defaultProps.setIsBackupProgressVisible).toHaveBeenCalledWith(true);
  });

  it("shows download button when temporaryLink is available", () => {
    render(
      <ManualBackup {...defaultProps} temporaryLink="/download/backup.zip" />,
    );

    const downloadButton = screen.getByText("Common:DownloadCopy");
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    expect(window.open).toHaveBeenCalledWith(
      "https://example.com/download/backup.zip",
      "_self",
    );
  });

  it("switches to Rooms Module when selected", async () => {
    render(<ManualBackup {...defaultProps} />);

    const roomsRadio = screen.getByLabelText("Common:RoomsModule");
    await userEvent.click(roomsRadio);

    expect(screen.getByTestId("rooms-module")).toBeInTheDocument();
  });

  it("switches to Third Party Resource when selected", async () => {
    render(<ManualBackup {...defaultProps} />);

    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    await userEvent.click(thirdPartyRadio);

    expect(screen.getByTestId("third-party-module")).toBeInTheDocument();
  });

  it("switches to Third Party Storage when selected", async () => {
    render(<ManualBackup {...defaultProps} />);

    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );
    await userEvent.click(thirdPartyStorageRadio);

    expect(
      screen.getByTestId("third-party-storage-module"),
    ).toBeInTheDocument();
  });

  it("handles backup from Rooms Module", async () => {
    render(<ManualBackup {...defaultProps} />);

    const roomsRadio = screen.getByLabelText("Common:RoomsModule");
    await userEvent.click(roomsRadio);

    const backupButton = screen.getByText("Common:CreateCopy");
    await userEvent.click(backupButton);

    expect(defaultProps.clearLocalStorage).toHaveBeenCalled();
    expect(defaultProps.saveToLocalStorage).toHaveBeenCalled();

    expect(startBackup).toHaveBeenCalled();

    expect(defaultProps.setIsBackupProgressVisible).toHaveBeenCalledWith(true);
    expect(defaultProps.setDownloadingProgress).toHaveBeenCalledWith(1);
  });

  it("handles backup from Third Party Resource", async () => {
    render(<ManualBackup {...defaultProps} />);

    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    await userEvent.click(thirdPartyRadio);

    const backupButton = screen.getByText("Common:Backup");
    await userEvent.click(backupButton);

    expect(defaultProps.clearLocalStorage).toHaveBeenCalled();
    expect(defaultProps.saveToLocalStorage).toHaveBeenCalled();

    expect(startBackup).toHaveBeenCalled();

    expect(defaultProps.setIsBackupProgressVisible).toHaveBeenCalledWith(true);
    expect(defaultProps.setDownloadingProgress).toHaveBeenCalledWith(1);
  });

  it("handles backup from Third Party Storage", async () => {
    render(<ManualBackup {...defaultProps} />);

    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );
    await userEvent.click(thirdPartyStorageRadio);

    const backupButton = screen.getByText("Common:Backup");
    await userEvent.click(backupButton);

    expect(defaultProps.clearLocalStorage).toHaveBeenCalled();
    expect(defaultProps.saveToLocalStorage).toHaveBeenCalled();

    expect(startBackup).toHaveBeenCalled();

    expect(defaultProps.setIsBackupProgressVisible).toHaveBeenCalledWith(true);
    expect(defaultProps.setDownloadingProgress).toHaveBeenCalledWith(1);
  });

  it("disables radio buttons and actions when downloadingProgress is not 100", () => {
    render(<ManualBackup {...defaultProps} downloadingProgress={50} />);

    const temporaryRadio = screen.getByLabelText("Common:TemporaryStorage");
    const roomsRadio = screen.getByLabelText("Common:RoomsModule");
    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );

    expect(temporaryRadio).toBeDisabled();
    expect(roomsRadio).toBeDisabled();
    expect(thirdPartyRadio).toBeDisabled();
    expect(thirdPartyStorageRadio).toBeDisabled();

    expect(screen.getByText("Common:Create").closest("button")).toBeDisabled();

    expect(screen.getByText("Common:CopyOperation ...")).toBeInTheDocument();
  });

  it("disables all options when pageIsDisabled is true", () => {
    render(<ManualBackup {...defaultProps} pageIsDisabled />);

    const temporaryRadio = screen.getByLabelText("Common:TemporaryStorage");
    const roomsRadio = screen.getByLabelText("Common:RoomsModule");
    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );

    expect(temporaryRadio).toBeDisabled();
    expect(roomsRadio).toBeDisabled();
    expect(thirdPartyRadio).toBeDisabled();
    expect(thirdPartyStorageRadio).toBeDisabled();

    const createButton = screen.getByText("Common:Create").closest("button");
    expect(createButton).toBeDisabled();
  });

  it("disables paid features when isNotPaidPeriod is true", () => {
    render(<ManualBackup {...defaultProps} isNotPaidPeriod />);

    const temporaryRadio = screen.getByLabelText("Common:TemporaryStorage");
    expect(temporaryRadio).not.toBeDisabled();

    const roomsRadio = screen.getByLabelText("Common:RoomsModule");
    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );

    expect(roomsRadio).toBeDisabled();
    expect(thirdPartyRadio).toBeDisabled();
    expect(thirdPartyStorageRadio).toBeDisabled();
  });

  it("handles error during backup creation", async () => {
    const error = new Error("Backup failed");
    (startBackup as jest.Mock).mockRejectedValueOnce(error);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<ManualBackup {...defaultProps} />);

    const createButton = screen.getByText("Common:Create");

    await userEvent.click(createButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });

  it("sets up and cleans up socket listeners", () => {
    const { unmount } = render(<ManualBackup {...defaultProps} />);

    expect(SocketHelper?.on).toHaveBeenCalled();

    unmount();

    expect(SocketHelper?.off).toHaveBeenCalled();
  });
});
