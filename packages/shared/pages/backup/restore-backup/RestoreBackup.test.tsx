import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { ButtonSize } from "../../../components/button";

import { RestoreBackup } from "./index";
import {
  selectedStorages,
  storageRegions,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  mockConnectedAccount,
} from "../mockData";

jest.mock("@docspace/shared/utils/socket", () => ({
  on: jest.fn(),
  off: jest.fn(),
  SocketEvents: {
    BackupProgress: "BACKUP_PROGRESS",
  },
}));

jest.mock("@docspace/shared/components/toast", () => ({
  toastr: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@docspace/shared/api/portal", () => ({
  startRestore: jest.fn().mockResolvedValue({ data: { success: true } }),
  getBackupHistory: jest.fn().mockResolvedValue({
    data: {
      items: [
        {
          id: "backup-1",
          createdOn: "2025-06-10T12:00:00Z",
          name: "backup-1.tar.gz",
          size: 1024,
          storageType: 0,
          tenantId: "tenant-1",
        },
      ],
      total: 1,
    },
  }),
  deleteBackup: jest.fn().mockResolvedValue({ data: { success: true } }),
  deleteBackupHistory: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

jest.mock("@docspace/shared/components/files-selector-input", () => ({
  FilesSelectorInput: () => (
    <div data-testid="files-selector-input">Files Selector</div>
  ),
}));

jest.mock("@docspace/shared/components/direct-third-party-connection", () => ({
  DirectThirdPartyConnection: () => (
    <div data-testid="third-party-connection">Third Party Connection</div>
  ),
}));

jest.mock("@docspace/shared/skeletons/backup/RestoreBackup", () => ({
  __esModule: true,
  default: () => <div data-testid="restore-backup-loader">Loading...</div>,
}));

const defaultProps = {
  removeItem: mockThirdPartyAccounts[0],
  buttonSize: ButtonSize.medium,
  isEnableRestore: true,
  navigate: jest.fn(),
  settingsFileSelector: {
    getIcon: jest.fn(),
  },
  isInitialLoading: false,
  standalone: false,
  setTenantStatus: jest.fn(),
  errorInformation: "",
  isBackupProgressVisible: false,
  restoreResource: "backup.tar.gz",
  formSettings: {},
  errorsFieldsBeforeSafe: {},
  thirdPartyStorage: [selectedStorages.amazon],
  storageRegions,
  defaultRegion: "us-east-1",
  accounts: mockThirdPartyAccounts,
  selectedThirdPartyAccount: mockThirdPartyAccounts[0],
  isTheSameThirdPartyAccount: false,
  downloadingProgress: 0,
  connectedThirdPartyAccount: mockConnectedAccount,
  setErrorInformation: jest.fn(),
  setTemporaryLink: jest.fn(),
  setDownloadingProgress: jest.fn(),
  setConnectedThirdPartyAccount: jest.fn(),
  setRestoreResource: jest.fn(),
  clearLocalStorage: jest.fn(),
  setSelectedThirdPartyAccount: jest.fn(),
  setThirdPartyAccountsInfo: jest.fn().mockResolvedValue(undefined),
  setCompletedFormFields: jest.fn(),
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  deleteValueFormSetting: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  isFormReady: jest.fn().mockReturnValue(true),
  getStorageParams: jest.fn().mockReturnValue([]),
  uploadLocalFile: jest.fn().mockResolvedValue(null),
  basePath: "/",
  newPath: "/",
  isErrorPath: false,
  toDefault: jest.fn(),
  setBasePath: jest.fn(),
  setNewPath: jest.fn(),
  providers: mockThirdPartyProviders,
  deleteThirdParty: jest.fn().mockResolvedValue(undefined),
  openConnectWindow: jest.fn().mockResolvedValue(null),
  setThirdPartyProviders: jest.fn(),
  connectDialogVisible: false,
  setConnectDialogVisible: jest.fn(),
  deleteThirdPartyDialogVisible: false,
  setDeleteThirdPartyDialogVisible: jest.fn(),
  setIsBackupProgressVisible: jest.fn(),
  backupProgressError: "",
  setBackupProgressError: jest.fn(),
};

describe("RestoreBackup", () => {
  it("renders without errors", () => {
    render(<RestoreBackup {...defaultProps} />);
    expect(screen.getByTestId("restore-backup")).toBeInTheDocument();
  });

  it("displays error information when provided", () => {
    const errorMessage = "Error occurred during backup restoration";
    render(<RestoreBackup {...defaultProps} errorInformation={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  // it("shows loading skeleton when isInitialLoading is true", () => {
  //   const { rerender } = render(
  //     <RestoreBackup {...defaultProps} isInitialLoading />,
  //   );

  //   rerender(<RestoreBackup {...defaultProps} isInitialLoading={false} />);
  //   expect(screen.getByTestId("restore-backup")).toBeInTheDocument();
  // });

  it("changes radio button state when clicked", async () => {
    render(<RestoreBackup {...defaultProps} />);

    const user = userEvent.setup();
    const backupRoomRadio = screen.getByLabelText("Common:RoomsModule");

    await user.click(backupRoomRadio);

    expect(defaultProps.setRestoreResource).toHaveBeenCalledWith(null);
  });

  it("toggles notification checkbox when clicked", async () => {
    render(<RestoreBackup {...defaultProps} />);

    const user = userEvent.setup();
    const notificationCheckbox = screen.getByLabelText(
      "Common:SendNotificationAboutRestoring",
    );

    await user.click(notificationCheckbox);
    await user.click(notificationCheckbox);

    expect(notificationCheckbox).toBeChecked();
  });

  it("toggles confirmation checkbox when clicked", async () => {
    render(<RestoreBackup {...defaultProps} />);

    const user = userEvent.setup();
    const confirmationCheckbox = screen.getByLabelText("Common:UserAgreement");

    await user.click(confirmationCheckbox);

    expect(confirmationCheckbox).toBeChecked();
  });

  it("opens backup list dialog when backup list text is clicked", async () => {
    render(<RestoreBackup {...defaultProps} />);

    const user = userEvent.setup();

    const backupListText = screen.getByText("Common:BackupList");

    await user.click(backupListText);

    expect(screen.getByTestId("backup-list-modal")).toBeInTheDocument();
  });

  it("disables all interactive elements when isEnableRestore is false", () => {
    render(<RestoreBackup {...defaultProps} isEnableRestore={false} />);

    const radioButtons = screen.getAllByRole("radio");
    const checkboxes = screen.getAllByRole("checkbox");

    radioButtons.forEach((radio) => {
      expect(radio).toBeDisabled();
    });

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });
});
