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
import { fireEvent, render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportDialog from ".";
import {
  DeviceType,
  EmployeeActivationStatus,
  EmployeeStatus,
} from "../../enums";
import { toastr } from "../toast";
import type { TUser } from "../../api/people/types";
import type { TFirebaseSettings } from "../../api/settings/types";
import FirebaseHelper from "../../utils/firebase";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

// Mock toast notifications
jest.mock("../toast", () => ({
  toastr: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock SVG imports
jest.mock("PUBLIC_DIR/images/icons/32/file.svg?url", () => "file-icon.svg");
jest.mock(
  "PUBLIC_DIR/images/icons/16/download.react.svg?url",
  () => "download-icon.svg",
);

// Mock utility functions
jest.mock("../../utils/crashReport", () => ({
  getCrashReport: jest.fn(() => ({ error: "test error" })),
  downloadJson: jest.fn(),
  getCurrentDate: jest.fn(() => "2024-12-27"),
}));

const mockSendCrashReport = jest.fn(() => Promise.resolve(true));

// Mock Firebase helper
jest.mock("../../utils/firebase", () => {
  return jest.fn().mockImplementation(() => ({
    remoteConfig: null,
    firebaseConfig: null,
    firebaseStorage: null,
    firebaseDB: null,
    config: {},
    isEnabled: true,
    isEnabledDB: true,
    checkMaintenance: jest.fn(),
    checkBar: jest.fn(),
    checkCampaigns: jest.fn(),
    getCampaignsImages: jest.fn(),
    getCampaignsTranslations: jest.fn(),
    getCampaignConfig: jest.fn(),
    sendCrashReport: mockSendCrashReport,
    sendToastReport: jest.fn(),
  }));
});

const mockUser: TUser = {
  isAnonim: false,
  id: "user-1",
  email: "user@example.com",
  displayName: "Test User",
  isVisitor: false,
  isAdmin: false,
  isCollaborator: false,
  cultureName: "en",
  avatarSmall: "",
  hasAvatar: false,
  profileUrl: "",
  isSSO: false,
  firstName: "Test",
  lastName: "User",
  userName: "testuser",
  access: 0,
  activationStatus: EmployeeActivationStatus.Activated,
  status: EmployeeStatus.Active,
  department: "",
  groups: [],
  isLDAP: false,
  isOwner: false,
  isRoomAdmin: false,
  mobilePhone: "",
  title: "",
  avatar: "",
  avatarMax: "",
  avatarMedium: "",
  avatarOriginal: "",
  listAdminModules: [],
  mobilePhoneActivationStatus: 0,
  workFrom: "",
};

const mockError = new Error("Test error message");

const mockFirebaseSettings: TFirebaseSettings = {
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
  storageBucket: "test-storage-bucket",
  messagingSenderId: "test-messaging-sender-id",
  appId: "test-app-id",
  databaseURL: "test-database-url",
  measurementId: "test-measurement-id",
};

const mockFirebaseHelper = new FirebaseHelper(mockFirebaseSettings);

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  error: mockError,
  user: mockUser,
  version: "1.0.0",
  firebaseHelper: mockFirebaseHelper,
  currentDeviceType: DeviceType.desktop,
};

describe("ReportDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const t = (key: string) => key;

  it("renders correctly", () => {
    render(<ReportDialog {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /SendButton/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /CancelButton/i }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("report-file")).toBeInTheDocument();
  });

  it("handles description input", () => {
    render(<ReportDialog {...defaultProps} />);

    const textarea = screen.getByTestId("textarea");
    fireEvent.change(textarea, { target: { value: "Test description" } });

    expect(textarea).toHaveValue("Test description");
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ReportDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", {
      name: t("CancelButton"),
    });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("sends crash report and shows success message", async () => {
    mockSendCrashReport.mockResolvedValueOnce(true);

    render(<ReportDialog {...defaultProps} />);

    const textarea = screen.getByTestId("textarea");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Test description" } });
    });

    const sendButton = screen.getByRole("button", { name: t("SendButton") });
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSendCrashReport).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Test description",
      }),
    );
    expect(toastr.success).toHaveBeenCalledWith(t("ErrorReportSuccess"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows error message when sending crash report fails", async () => {
    const error = new Error("Failed to send report");
    mockSendCrashReport.mockRejectedValueOnce(error);

    render(<ReportDialog {...defaultProps} />);

    const textarea = screen.getByTestId("textarea");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Test description" } });
    });

    const sendButton = screen.getByRole("button", { name: t("SendButton") });
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSendCrashReport).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Test description",
      }),
    );
    expect(toastr.error).toHaveBeenCalledWith(error);
  });

  it("clears description when dialog is closed", async () => {
    render(<ReportDialog {...defaultProps} />);

    const textarea = screen.getByTestId("textarea");
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Test description" } });
    });

    const cancelButton = screen.getByRole("button", {
      name: t("CancelButton"),
    });
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(textarea).toHaveValue("");
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
