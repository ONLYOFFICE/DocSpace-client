/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import ReportDialog from ".";
import {
  DeviceType,
  EmployeeActivationStatus,
  EmployeeStatus,
} from "../../enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TUser } from "../../api/people/types";
import type { TFirebaseSettings } from "../../api/settings/types";
import FirebaseHelper from "../../utils/firebase";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

// Mock toast notifications
vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock SVG imports
vi.mock("PUBLIC_DIR/images/icons/32/file.svg?url", () => ({
  default: "file-icon.svg",
}));
vi.mock("PUBLIC_DIR/images/icons/16/download.react.svg?url", () => ({
  default: "download-icon.svg",
}));

// Mock utility functions
vi.mock("../../utils/crashReport", () => ({
  getCrashReport: vi.fn(() => ({ error: "test error" })),
  downloadJson: vi.fn(),
  getCurrentDate: vi.fn(() => "2024-12-27"),
}));

const mockSendCrashReport = vi.fn(() => Promise.resolve(true));

// Mock Firebase helper
vi.mock("../../utils/firebase", () => ({
  default: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.remoteConfig = null;
    this.firebaseConfig = null;
    this.firebaseStorage = null;
    this.firebaseDB = null;
    this.config = {};
    this.isEnabled = true;
    this.isEnabledDB = true;
    this.checkMaintenance = vi.fn();
    this.checkBar = vi.fn();
    this.checkCampaigns = vi.fn();
    this.getCampaignsImages = vi.fn();
    this.getCampaignsTranslations = vi.fn();
    this.getCampaignConfig = vi.fn();
    this.sendCrashReport = mockSendCrashReport;
    this.sendToastReport = vi.fn();
  }),
}));

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
  onClose: vi.fn(),
  error: mockError,
  user: mockUser,
  version: "1.0.0",
  firebaseHelper: mockFirebaseHelper,
  currentDeviceType: DeviceType.desktop,
};

describe("ReportDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
