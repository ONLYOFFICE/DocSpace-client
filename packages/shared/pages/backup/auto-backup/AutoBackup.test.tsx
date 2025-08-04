import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { BackupStorageType, FolderType } from "../../../enums";
import { ButtonSize } from "../../../components/button";
import { renderWithTheme } from "../../../utils/render-with-theme";
import {
  deleteBackupSchedule,
  createBackupSchedule,
} from "../../../api/portal";

import AutomaticBackup from "./index";
import { selectedStorages, mockThirdPartyAccounts } from "../mockData";

jest.mock("@docspace/shared/api/portal", () => ({
  deleteBackupSchedule: jest.fn().mockResolvedValue(undefined),
  getBackupSchedule: jest.fn().mockResolvedValue(undefined),
  createBackupSchedule: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@docspace/shared/api/settings", () => ({
  getBackupStorage: jest.fn().mockResolvedValue(undefined),
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
  SocketEvents: {
    BackupProgress: "BACKUP_PROGRESS",
  },
}));

jest.mock("./sub-components/RoomsModule", () => ({
  RoomsModule: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="rooms-module">Rooms Module Content</div>
    )),
}));

jest.mock("./sub-components/ThirdPartyModule", () => ({
  ThirdPartyModule: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="third-party-module">Third Party Module Content</div>
    )),
}));

jest.mock("./sub-components/ThirdPartyStorageModule", () => ({
  ThirdPartyStorageModule: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="third-party-storage-module">
        Third Party Storage Module Content
      </div>
    )),
}));

describe("AutomaticBackup", () => {
  const defaultProps = {
    language: "en",
    setDefaultOptions: jest.fn(),
    setThirdPartyStorage: jest.fn(),
    setBackupSchedule: jest.fn(),
    setConnectedThirdPartyAccount: jest.fn(),
    rootFoldersTitles: {
      [FolderType.USER]: { title: "My Documents", id: 1 },
    },
    seStorageType: jest.fn(),
    setSelectedEnableSchedule: jest.fn(),
    toDefault: jest.fn(),
    selectedStorageType: `${BackupStorageType.DocumentModuleType}`,
    resetNewFolderPath: jest.fn(),
    updateBaseFolderPath: jest.fn(),
    isFormReady: jest.fn().mockReturnValue(true),
    selectedFolderId: "folder-id",
    getStorageParams: jest.fn().mockReturnValue([]),
    selectedEnableSchedule: true,
    selectedHour: "10:00",
    selectedMaxCopiesNumber: "5",
    selectedMonthDay: "15",
    selectedPeriodNumber: "0",
    selectedStorageId: "storage-id",
    selectedWeekday: "1",
    deleteSchedule: jest.fn(),
    buttonSize: ButtonSize.normal,
    downloadingProgress: 0,
    isEnableAuto: true,
    automaticBackupUrl: "https://example.com/help/auto-backup",
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
      isBase: true,
    },
    isBackupProgressVisible: false,
    setIsBackupProgressVisible: jest.fn(),
    isChanged: false,
    isThirdStorageChanged: false,
    settingsFileSelector: {
      getIcon: jest.fn(),
    },
    basePath: "/",
    isErrorPath: false,
    newPath: "",
    setBasePath: jest.fn(),
    setNewPath: jest.fn(),
    toDefaultFileSelector: jest.fn(),
    setSelectedFolder: jest.fn(),
    defaultStorageType: `${BackupStorageType.DocumentModuleType}`,
    defaultFolderId: "default-folder-id",
    openConnectWindow: jest.fn(),
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    connectedThirdPartyAccount: null,
    setConnectDialogVisible: jest.fn(),
    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    setDeleteThirdPartyDialogVisible: jest.fn(),
    setMaxCopies: jest.fn(),
    setMonthNumber: jest.fn(),
    setPeriod: jest.fn(),
    setTime: jest.fn(),
    setWeekday: jest.fn(),
    setStorageId: jest.fn(),
    thirdPartyStorage: Object.values(selectedStorages),
    defaultStorageId: "default-storage-id",
    setCompletedFormFields: jest.fn(),
    errorsFieldsBeforeSafe: {},
    formSettings: {},
    addValueInFormSettings: jest.fn(),
    setIsThirdStorageChanged: jest.fn(),
    setRequiredFormSettings: jest.fn(),
    storageRegions: [
      { systemName: "us-east-1", displayName: "US East (N. Virginia)" },
    ],
    defaultRegion: "us-east-1",
    deleteValueFormSetting: jest.fn(),
    clearLocalStorage: jest.fn(),
    setSelectedThirdPartyAccount: jest.fn(),
    isTheSameThirdPartyAccount: false,
    selectedThirdPartyAccount: null,
    accounts: [],
    setThirdPartyAccountsInfo: jest.fn(),
    deleteThirdParty: jest.fn(),
    providers: [],
    setThirdPartyProviders: jest.fn(),
    removeItem: mockThirdPartyAccounts[0],
    isNeedFilePath: false,
    isEmptyContentBeforeLoader: false,
    isInitialLoading: false,
    setDownloadingProgress: jest.fn(),
    setTemporaryLink: jest.fn(),
    setErrorInformation: jest.fn(),
    isInitialError: false,
    errorInformation: "",
    isManagement: false,
    backupProgressError: "",
    setBackupProgressError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} />);

    expect(screen.getByTestId("auto-backup")).toBeInTheDocument();
  });

  it("shows loader when isInitialLoading is true", () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} isInitialLoading />);

    expect(screen.getByTestId("auto-backup-loader")).toBeInTheDocument();
  });

  it("does not render content when isEmptyContentBeforeLoader is true and isInitialLoading is false", () => {
    const { container } = renderWithTheme(
      <AutomaticBackup
        {...defaultProps}
        isEmptyContentBeforeLoader
        isInitialLoading={false}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("displays error message when errorInformation is provided", () => {
    renderWithTheme(
      <AutomaticBackup
        {...defaultProps}
        errorInformation="Test error message"
      />,
    );

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("toggles automatic backup when toggle button is clicked", async () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} />);

    const toggleButton = screen.getByRole("checkbox");
    await userEvent.click(toggleButton);

    expect(defaultProps.setSelectedEnableSchedule).toHaveBeenCalled();
  });

  it("switches to Third Party Resource when selected", async () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} />);

    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    await userEvent.click(thirdPartyRadio);

    expect(defaultProps.seStorageType).toHaveBeenCalledWith(
      `${BackupStorageType.ResourcesModuleType}`,
    );
  });

  it("switches to Third Party Storage when selected", async () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} />);

    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );
    await userEvent.click(thirdPartyStorageRadio);

    expect(defaultProps.seStorageType).toHaveBeenCalledWith(
      `${BackupStorageType.StorageModuleType}`,
    );
  });

  it("renders save and cancel buttons when changes are made", () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} isChanged />);

    expect(screen.getByText("Common:SaveButton")).toBeInTheDocument();
    expect(screen.getByText("Common:CancelButton")).toBeInTheDocument();
  });

  it("shows paid badge when isEnableAuto is false", () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} isEnableAuto={false} />);

    expect(screen.getByText("Common:Paid")).toBeInTheDocument();
  });

  it("calls deleteBackupSchedule when toggle is turned off and save is clicked", async () => {
    renderWithTheme(
      <AutomaticBackup
        {...defaultProps}
        selectedEnableSchedule={false}
        isChanged
      />,
    );

    const saveButton = screen.getByText("Common:SaveButton");
    await userEvent.click(saveButton);

    expect(deleteBackupSchedule).toHaveBeenCalled();
  });

  it("calls createBackupSchedule when settings are saved", async () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} isChanged />);

    const saveButton = screen.getByText("Common:SaveButton");
    await userEvent.click(saveButton);

    expect(createBackupSchedule).toHaveBeenCalled();
  });

  it("calls toDefault when cancel button is clicked", async () => {
    renderWithTheme(<AutomaticBackup {...defaultProps} isChanged />);

    const cancelButton = screen.getByText("Common:CancelButton");
    await userEvent.click(cancelButton);

    expect(defaultProps.toDefault).toHaveBeenCalled();
  });
});
