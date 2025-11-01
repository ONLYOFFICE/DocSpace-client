import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BackupStorageType, FolderType } from "../../../enums";
import { ButtonSize } from "../../../components/button";
import * as portalApi from "../../../api/portal";

import AutomaticBackup from "./index";
import { selectedStorages, mockThirdPartyAccounts } from "../mockData";

vi.mock("@docspace/shared/api/portal", () => ({
  deleteBackupSchedule: vi.fn().mockResolvedValue(undefined),
  getBackupSchedule: vi.fn().mockResolvedValue(undefined),
  createBackupSchedule: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@docspace/shared/api/settings", () => ({
  getBackupStorage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@docspace/shared/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@docspace/shared/utils/socket", () => ({
  on: vi.fn(),
  off: vi.fn(),
  SocketEvents: {
    BackupProgress: "BACKUP_PROGRESS",
  },
}));

vi.mock("./sub-components/RoomsModule", () => ({
  RoomsModule: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="rooms-module">Rooms Module Content</div>
    )),
}));

vi.mock("./sub-components/ThirdPartyModule", () => ({
  ThirdPartyModule: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="third-party-module">Third Party Module Content</div>
    )),
}));

vi.mock("./sub-components/ThirdPartyStorageModule", () => ({
  ThirdPartyStorageModule: vi
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
    setDefaultOptions: vi.fn(),
    setThirdPartyStorage: vi.fn(),
    setBackupSchedule: vi.fn(),
    setConnectedThirdPartyAccount: vi.fn(),
    rootFoldersTitles: {
      [FolderType.USER]: { title: "My Documents", id: 1 },
    },
    seStorageType: vi.fn(),
    setSelectedEnableSchedule: vi.fn(),
    toDefault: vi.fn(),
    selectedStorageType: `${BackupStorageType.DocumentModuleType}`,
    resetNewFolderPath: vi.fn(),
    updateBaseFolderPath: vi.fn(),
    isFormReady: vi.fn().mockReturnValue(true),
    selectedFolderId: "folder-id",
    getStorageParams: vi.fn().mockReturnValue([]),
    selectedEnableSchedule: true,
    selectedHour: "10:00",
    selectedMaxCopiesNumber: "5",
    selectedMonthDay: "15",
    selectedPeriodNumber: "0",
    selectedStorageId: "storage-id",
    selectedWeekday: "1",
    deleteSchedule: vi.fn(),
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
    setIsBackupProgressVisible: vi.fn(),
    isChanged: false,
    isThirdStorageChanged: false,
    settingsFileSelector: {
      getIcon: vi.fn(),
    },
    basePath: "/",
    isErrorPath: false,
    newPath: "",
    setBasePath: vi.fn(),
    setNewPath: vi.fn(),
    toDefaultFileSelector: vi.fn(),
    setSelectedFolder: vi.fn(),
    defaultStorageType: `${BackupStorageType.DocumentModuleType}`,
    defaultFolderId: "default-folder-id",
    openConnectWindow: vi.fn(),
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    connectedThirdPartyAccount: null,
    setConnectDialogVisible: vi.fn(),
    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    setDeleteThirdPartyDialogVisible: vi.fn(),
    setMaxCopies: vi.fn(),
    setMonthNumber: vi.fn(),
    setPeriod: vi.fn(),
    setTime: vi.fn(),
    setWeekday: vi.fn(),
    setStorageId: vi.fn(),
    thirdPartyStorage: Object.values(selectedStorages),
    defaultStorageId: "default-storage-id",
    setCompletedFormFields: vi.fn(),
    errorsFieldsBeforeSafe: {},
    formSettings: {},
    addValueInFormSettings: vi.fn(),
    setIsThirdStorageChanged: vi.fn(),
    setRequiredFormSettings: vi.fn(),
    storageRegions: [
      { systemName: "us-east-1", displayName: "US East (N. Virginia)" },
    ],
    defaultRegion: "us-east-1",
    deleteValueFormSetting: vi.fn(),
    clearLocalStorage: vi.fn(),
    setSelectedThirdPartyAccount: vi.fn(),
    isTheSameThirdPartyAccount: false,
    selectedThirdPartyAccount: null,
    accounts: [],
    setThirdPartyAccountsInfo: vi.fn(),
    deleteThirdParty: vi.fn(),
    providers: [],
    setThirdPartyProviders: vi.fn(),
    removeItem: mockThirdPartyAccounts[0],
    isNeedFilePath: false,
    isEmptyContentBeforeLoader: false,
    isInitialLoading: false,
    setDownloadingProgress: vi.fn(),
    setTemporaryLink: vi.fn(),
    setErrorInformation: vi.fn(),
    isInitialError: false,
    errorInformation: "",
    isManagement: false,
    backupProgressError: "",
    setBackupProgressError: vi.fn(),
    backupProgressWarning: "",
    setBackupProgressWarning: vi.fn(),
    setDefaultFolderId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(portalApi, "deleteBackupSchedule").mockResolvedValue(undefined);
    vi.spyOn(portalApi, "createBackupSchedule").mockResolvedValue(undefined);
  });

  it("renders without errors", () => {
    render(<AutomaticBackup {...defaultProps} />);

    expect(screen.getByTestId("auto-backup")).toBeInTheDocument();
  });

  it("shows loader when isInitialLoading is true", () => {
    render(<AutomaticBackup {...defaultProps} isInitialLoading />);

    expect(screen.getByTestId("auto-backup-loader")).toBeInTheDocument();
  });

  it("does not render content when isEmptyContentBeforeLoader is true and isInitialLoading is false", () => {
    const { container } = render(
      <AutomaticBackup
        {...defaultProps}
        isEmptyContentBeforeLoader
        isInitialLoading={false}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("displays error message when errorInformation is provided", () => {
    render(
      <AutomaticBackup
        {...defaultProps}
        errorInformation="Test error message"
      />,
    );

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("toggles automatic backup when toggle button is clicked", async () => {
    render(<AutomaticBackup {...defaultProps} />);

    const toggleButton = screen.getByRole("checkbox");
    await userEvent.click(toggleButton);

    expect(defaultProps.setSelectedEnableSchedule).toHaveBeenCalled();
  });

  it("switches to Third Party Resource when selected", async () => {
    render(<AutomaticBackup {...defaultProps} />);

    const thirdPartyRadio = screen.getByLabelText("Common:ThirdPartyResource");
    await userEvent.click(thirdPartyRadio);

    expect(defaultProps.seStorageType).toHaveBeenCalledWith(
      `${BackupStorageType.ResourcesModuleType}`,
    );
  });

  it("switches to Third Party Storage when selected", async () => {
    render(<AutomaticBackup {...defaultProps} />);

    const thirdPartyStorageRadio = screen.getByLabelText(
      "Common:ThirdPartyStorage",
    );
    await userEvent.click(thirdPartyStorageRadio);

    expect(defaultProps.seStorageType).toHaveBeenCalledWith(
      `${BackupStorageType.StorageModuleType}`,
    );
  });

  it("renders save and cancel buttons when changes are made", () => {
    render(<AutomaticBackup {...defaultProps} isChanged />);

    expect(screen.getByText("Common:SaveButton")).toBeInTheDocument();
    expect(screen.getByText("Common:CancelButton")).toBeInTheDocument();
  });

  it("calls deleteBackupSchedule when toggle is turned off and save is clicked", async () => {
    render(
      <AutomaticBackup
        {...defaultProps}
        selectedEnableSchedule={false}
        isChanged
      />,
    );

    const saveButton = screen.getByText("Common:SaveButton");
    await userEvent.click(saveButton);

    expect(vi.mocked(portalApi.deleteBackupSchedule)).toHaveBeenCalled();
  });

  it("calls createBackupSchedule when settings are saved", async () => {
    render(<AutomaticBackup {...defaultProps} isChanged />);

    const saveButton = screen.getByText("Common:SaveButton");
    await userEvent.click(saveButton);

    expect(vi.mocked(portalApi.createBackupSchedule)).toHaveBeenCalled();
  });

  it("calls toDefault when cancel button is clicked", async () => {
    render(<AutomaticBackup {...defaultProps} isChanged />);

    const cancelButton = screen.getByText("Common:CancelButton");
    await userEvent.click(cancelButton);

    expect(defaultProps.toDefault).toHaveBeenCalled();
  });
});
