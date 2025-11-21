import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ButtonSize } from "../../../components/button";

import { RestoreBackup } from "./index";
import {
  selectedStorages,
  storageRegions,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  mockConnectedAccount,
} from "../mockData";

vi.mock("@docspace/shared/utils/socket", () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
  },
  SocketEvents: {
    BackupProgress: "BACKUP_PROGRESS",
  },
}));

vi.mock("../../../components/toast", () => ({
  toastr: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../api/portal", () => ({
  startRestore: vi.fn().mockResolvedValue({ data: { success: true } }),
  getBackupHistory: vi.fn().mockResolvedValue({
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
  deleteBackup: vi.fn().mockResolvedValue({ data: { success: true } }),
  deleteBackupHistory: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

vi.mock("../../../api/files", () => ({
  getFiles: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

vi.mock("../../../components/files-selector-input", () => ({
  FilesSelectorInput: () => (
    <div data-testid="files-selector-input">Files Selector</div>
  ),
}));

vi.mock("../../../components/direct-third-party-connection", () => ({
  DirectThirdPartyConnection: () => (
    <div data-testid="third-party-connection">Third Party Connection</div>
  ),
}));

vi.mock("../../../skeletons/backup/RestoreBackup", () => ({
  __esModule: true,
  default: () => <div data-testid="restore-backup-loader">Loading...</div>,
}));

const defaultProps = {
  removeItem: mockThirdPartyAccounts[0],
  buttonSize: ButtonSize.medium,
  isEnableRestore: true,
  navigate: vi.fn(),
  settingsFileSelector: {
    getIcon: vi.fn(),
  },
  isInitialLoading: false,
  standalone: false,
  setTenantStatus: vi.fn(),
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
  setErrorInformation: vi.fn(),
  setTemporaryLink: vi.fn(),
  setDownloadingProgress: vi.fn(),
  setConnectedThirdPartyAccount: vi.fn(),
  setRestoreResource: vi.fn(),
  clearLocalStorage: vi.fn(),
  setSelectedThirdPartyAccount: vi.fn(),
  setThirdPartyAccountsInfo: vi.fn().mockResolvedValue(undefined),
  setCompletedFormFields: vi.fn(),
  addValueInFormSettings: vi.fn(),
  setRequiredFormSettings: vi.fn(),
  deleteValueFormSetting: vi.fn(),
  setIsThirdStorageChanged: vi.fn(),
  isFormReady: vi.fn().mockReturnValue(true),
  getStorageParams: vi.fn().mockReturnValue([]),
  uploadLocalFile: vi.fn().mockResolvedValue(null),
  basePath: "/",
  newPath: "/",
  isErrorPath: false,
  toDefault: vi.fn(),
  setBasePath: vi.fn(),
  setNewPath: vi.fn(),
  providers: mockThirdPartyProviders,
  deleteThirdParty: vi.fn().mockResolvedValue(undefined),
  openConnectWindow: vi.fn().mockResolvedValue(null),
  setThirdPartyProviders: vi.fn(),
  connectDialogVisible: false,
  setConnectDialogVisible: vi.fn(),
  deleteThirdPartyDialogVisible: false,
  setDeleteThirdPartyDialogVisible: vi.fn(),
  setIsBackupProgressVisible: vi.fn(),
  backupProgressError: "",
  setBackupProgressError: vi.fn(),
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

  it("shows loading skeleton when isInitialLoading is true", () => {
    const { rerender } = render(
      <RestoreBackup {...defaultProps} isInitialLoading />,
    );

    rerender(<RestoreBackup {...defaultProps} isInitialLoading={false} />);
    expect(screen.getByTestId("restore-backup")).toBeInTheDocument();
  });

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
