/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ButtonSize } from "../button";

import DirectThirdPartyConnection from "./DirectThirdPartyConnection";
import {
  mockAccounts,
  mockConnectedAccount,
  mockProviders,
  mockFilesSelectorSettings,
} from "./mockData";

vi.mock("../../api/files", () => ({
  saveSettingsThirdParty: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../utils/common", async () => {
  const originalModule = await vi.importActual("../../utils/common");

  return {
    ...originalModule,
    buildDataTestId: vi.fn(),
    getOAuthToken: vi.fn().mockResolvedValue("mock-oauth-token"),
    getIconPathByFolderType: vi.fn().mockReturnValue("folder-icon-path"),
  };
});

vi.mock("../toast", () => ({
  toastr: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../files-selector-input", () => ({
  __esModule: true,
  FilesSelectorInput: ({
    isDisabled,
    isError,
  }: {
    isDisabled?: boolean;
    isError?: boolean;
  }) => (
    <div
      data-testid="files-selector-input"
      data-disabled={isDisabled}
      data-iserror={isError}
    >
      Files Selector Input
    </div>
  ),
}));

vi.mock("../../selectors/Files", () => ({
  __esModule: true,
  default: () => <div data-testid="files-selector">Files Selector</div>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      ready: true,
    };
  },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

describe("DirectThirdPartyConnection", () => {
  const defaultProps = {
    openConnectWindow: vi.fn().mockResolvedValue(window),
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    setConnectDialogVisible: vi.fn(),
    setDeleteThirdPartyDialogVisible: vi.fn(),
    clearLocalStorage: vi.fn(),
    setSelectedThirdPartyAccount: vi.fn(),
    setThirdPartyAccountsInfo: vi.fn().mockResolvedValue(undefined),
    deleteThirdParty: vi.fn().mockResolvedValue(undefined),
    setConnectedThirdPartyAccount: vi.fn(),
    setThirdPartyProviders: vi.fn(),
    providers: mockProviders,
    removeItem: mockAccounts[1],
    newPath: "/",
    basePath: "/",
    isErrorPath: false,
    filesSelectorSettings: mockFilesSelectorSettings,
    setBasePath: vi.fn(),
    toDefault: vi.fn(),
    setNewPath: vi.fn(),
    setDefaultFolderId: vi.fn(),
    accounts: mockAccounts,
    buttonSize: ButtonSize.normal,
    onSelectFolder: vi.fn(),
    onSelectFile: vi.fn(),
    isTheSameThirdPartyAccount: false,
    selectedThirdPartyAccount: {
      ...mockAccounts[0],
      provider_link: "https://example.com/oauth",
    },
    connectedThirdPartyAccount: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without errors", async () => {
    await act(async () => {
      render(<DirectThirdPartyConnection {...defaultProps} />);
    });

    const comboboxLabel = screen.getByTitle(mockAccounts[0].title);
    expect(comboboxLabel).toBeInTheDocument();
  });

  it("renders combobox with account options", async () => {
    await act(async () => {
      render(<DirectThirdPartyConnection {...defaultProps} />);
    });

    const combobox = screen.getByTestId("combobox");
    await act(async () => {
      fireEvent.click(combobox);
    });

    const dropdownItems = screen.getAllByTestId("drop-down-item");
    expect(dropdownItems.length).toBe(mockAccounts.length);
  });

  it("calls setSelectedThirdPartyAccount when selecting an account", async () => {
    const fakeWindow = {
      postMessage: vi.fn(),
      close: vi.fn(),
    } as unknown as Window;
    const mockOpen = vi.fn().mockReturnValue(fakeWindow);
    const originalOpen = window.open;
    window.open = mockOpen;

    try {
      await act(async () => {
        render(<DirectThirdPartyConnection {...defaultProps} />);
      });

      const combobox = screen.getByTestId("combobox");
      await act(async () => {
        fireEvent.click(combobox);
      });

      const dropdownItems = screen.getAllByTestId("drop-down-item");
      const accountOption = dropdownItems[1];

      await act(async () => {
        fireEvent.click(accountOption);
      });

      expect(defaultProps.setSelectedThirdPartyAccount).toHaveBeenCalled();
    } finally {
      window.open = originalOpen;
    }
  });

  it("shows connect button when not connected", async () => {
    await act(async () => {
      render(<DirectThirdPartyConnection {...defaultProps} />);
    });

    const connectButton = screen.getByTestId("connect-button");
    expect(connectButton).toHaveTextContent("Common:Connect");
  });

  it("calls openConnectWindow when clicking connect button", async () => {
    const fakeWindow = {
      postMessage: vi.fn(),
      close: vi.fn(),
    } as unknown as Window;
    const mockOpen = vi.fn().mockReturnValue(fakeWindow);
    const originalOpen = window.open;
    window.open = mockOpen;

    try {
      const enabledProps = {
        ...defaultProps,
        accounts: mockAccounts,
        selectedThirdPartyAccount: {
          ...mockAccounts[0],
          provider_link: "https://example.com/oauth",
          connected: true,
        },
      };

      await act(async () => {
        render(<DirectThirdPartyConnection {...enabledProps} />);
      });

      const connectButton = screen.getByTestId("connect-button");

      await userEvent.click(connectButton);

      expect(defaultProps.openConnectWindow).toHaveBeenCalled();
    } finally {
      window.open = originalOpen;
    }
  });

  it("renders files selector when connected", async () => {
    const connectedProps = {
      ...defaultProps,
      connectedThirdPartyAccount: mockConnectedAccount,
      selectedThirdPartyAccount: mockAccounts[2],
      isTheSameThirdPartyAccount: true,
    };

    await act(async () => {
      render(<DirectThirdPartyConnection {...connectedProps} />);
    });

    const filesSelector = screen.getByTestId("files-selector-input");
    expect(filesSelector).toBeInTheDocument();
  });

  it("renders disabled state correctly", async () => {
    await act(async () => {
      render(<DirectThirdPartyConnection {...defaultProps} isDisabled />);
    });

    const connectButton = screen.getByTestId("connect-button");
    expect(connectButton).toBeDisabled();
  });

  it("renders error state correctly", async () => {
    const connectedProps = {
      ...defaultProps,
      connectedThirdPartyAccount: mockConnectedAccount,
      selectedThirdPartyAccount: mockAccounts[2],
      isTheSameThirdPartyAccount: true,
    };

    await act(async () => {
      render(<DirectThirdPartyConnection {...connectedProps} isError />);
    });

    const filesSelector = screen.getByTestId("files-selector-input");
    expect(filesSelector).toBeInTheDocument();
    expect(filesSelector).toHaveAttribute("data-iserror", "true");
  });
});
