import React, { act } from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { BackupStorageType, ProvidersType } from "../../../../../enums";
import { ButtonSize } from "../../../../../components/button";
import ThirdPartyModule from "./ThirdPartyModule";

const mockThirdPartyAccount = {
  name: "ownCloud",
  label: "ownCloud",
  title: "ownCloud",
  provider_key: "ownCloud",
  key: "WebDav",
  storageIsConnected: false,
  connected: true,
  disabled: false,
};

const defaultProps = {
  onMakeCopy: jest.fn().mockResolvedValue(undefined),
  isMaxProgress: true,
  buttonSize: ButtonSize.medium,
  connectedThirdPartyAccount: {
    id: "account-id",
    providerKey: ProvidersType.Box,
    title: "Box Account",
    providerId: "Box",
  },
  isTheSameThirdPartyAccount: true,
  openConnectWindow: jest.fn().mockResolvedValue(null),
  connectDialogVisible: false,
  deleteThirdPartyDialogVisible: false,
  setConnectDialogVisible: jest.fn(),
  setDeleteThirdPartyDialogVisible: jest.fn(),
  clearLocalStorage: jest.fn(),
  setSelectedThirdPartyAccount: jest.fn(),
  selectedThirdPartyAccount: mockThirdPartyAccount,
  accounts: [mockThirdPartyAccount],
  setThirdPartyAccountsInfo: jest.fn().mockResolvedValue(undefined),
  deleteThirdParty: jest.fn().mockResolvedValue(undefined),
  setConnectedThirdPartyAccount: jest.fn(),
  setThirdPartyProviders: jest.fn(),
  providers: [
    {
      corporate: false,
      roomsStorage: false,
      customerTitle: "Google Drive",
      providerId: "google",
      providerKey: "google",
      provider_id: "google",
      customer_title: "Google Drive",
    },
  ],
  removeItem: mockThirdPartyAccount,
  newPath: "/",
  basePath: "/",
  isErrorPath: false,
  filesSelectorSettings: { getIcon: jest.fn() },
  setBasePath: jest.fn(),
  toDefault: jest.fn(),
  setNewPath: jest.fn(),
};

jest.mock("../../../../../components/direct-third-party-connection", () => ({
  DirectThirdPartyConnection: ({
    onSelectFolder,
    isDisabled,
    isError,
  }: {
    onSelectFolder?: (id: string) => void;
    isDisabled?: boolean;
    isError?: boolean;
  }) => (
    <div data-testid="direct-third-party-connection">
      <button
        type="button"
        data-testid="select-folder-button"
        disabled={isDisabled}
        onClick={() => onSelectFolder?.("folder-id")}
      >
        Select Folder
      </button>
      {isError ? <div data-testid="error-message">Error</div> : null}
    </div>
  ),
}));

describe("ThirdPartyModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);
  });

  it("renders without errors", () => {
    render(<ThirdPartyModule {...defaultProps} />);
    expect(screen.getByTestId("third-party-module")).toBeInTheDocument();
    expect(
      screen.getByTestId("direct-third-party-connection"),
    ).toBeInTheDocument();
  });

  it("shows create copy button when connected to third party account", () => {
    render(<ThirdPartyModule {...defaultProps} />);
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("hides create copy button when not connected to third party account", () => {
    render(
      <ThirdPartyModule {...defaultProps} connectedThirdPartyAccount={null} />,
    );
    expect(screen.queryByText("Common:CreateCopy")).not.toBeInTheDocument();
  });

  it("disables create copy button when no folder is selected", () => {
    render(<ThirdPartyModule {...defaultProps} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("enables create copy button when folder is selected", async () => {
    render(<ThirdPartyModule {...defaultProps} />);

    fireEvent.click(screen.getByTestId("select-folder-button"));

    await waitFor(() => {
      expect(screen.getByText("Common:CreateCopy")).not.toBeDisabled();
    });
  });

  it("calls onMakeCopy with correct parameters when create copy button is clicked", async () => {
    render(<ThirdPartyModule {...defaultProps} />);

    fireEvent.click(screen.getByTestId("select-folder-button"));

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    await waitFor(() => {
      expect(defaultProps.onMakeCopy).toHaveBeenCalledWith(
        "folder-id",
        "ThirdPartyResource",
        `${BackupStorageType.ResourcesModuleType}`,
      );
    });
  });

  it("disables the module when isMaxProgress is false", () => {
    render(<ThirdPartyModule {...defaultProps} isMaxProgress={false} />);
    expect(screen.getByTestId("select-folder-button")).toBeDisabled();
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("validates folder selection before making a copy", async () => {
    const mockOnMakeCopy = jest.fn().mockResolvedValue(undefined);
    render(<ThirdPartyModule {...defaultProps} onMakeCopy={mockOnMakeCopy} />);

    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();

    fireEvent.click(screen.getByTestId("select-folder-button"));

    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    expect(mockOnMakeCopy).toHaveBeenCalledWith(
      "folder-id",
      "ThirdPartyResource",
      `${BackupStorageType.ResourcesModuleType}`,
    );
  });
});
