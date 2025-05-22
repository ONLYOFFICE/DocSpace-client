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
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { EncryptionPortal } from "./index";
import { EncryptionProgressSocketEvent } from "./EncryptionPortal.types";
import { renderWithTheme } from "../../utils/render-with-theme";
import SocketHelper, { SocketEvents } from "../../utils/socket";
import * as settingsApi from "../../api/settings";

// Mock the socket helper
jest.mock("../../utils/socket", () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
  },
  SocketEvents: {
    EncryptionProgress: "encryption-progress",
  },
}));

// Mock the settings API
jest.mock("../../api/settings", () => ({
  getEncryptionProgress: jest.fn().mockResolvedValue(50),
}));

// Mock the utils
jest.mock("./EncryptionPortal.utils", () => ({
  returnToPortal: jest.fn(),
}));

// Mock the translation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

describe("EncryptionPortal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders state initially", () => {
    renderWithTheme(<EncryptionPortal />);

    expect(screen.getByTestId("encryption-portal")).toBeInTheDocument();
  });

  test("renders progress bar when encryption is in progress", async () => {
    (settingsApi.getEncryptionProgress as jest.Mock).mockResolvedValue(50);

    renderWithTheme(<EncryptionPortal />);

    await waitFor(
      () => {
        const progressText = screen.queryByText(/50\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const progressBar = screen.getByTestId("encryption-progress-bar");

    expect(screen.getByText("EncryptionPortalSubtitle")).toBeInTheDocument();
    expect(screen.getByText("EncryptionPortalTitle")).toBeInTheDocument();

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(progressBar).toHaveAttribute("data-percent", "50");
  });

  test("renders error message when API call fails", async () => {
    const errorMessage = "API Error";
    (settingsApi.getEncryptionProgress as jest.Mock).mockRejectedValue({
      response: {
        data: {
          error: {
            message: errorMessage,
          },
        },
      },
    });

    renderWithTheme(<EncryptionPortal />);

    await waitFor(
      () => {
        expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
        expect(screen.getByText("Error")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const errorContainer = screen.getByTestId("encryption-portal-error");
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute("data-error", "true");
  });

  test("updates progress via socket events", async () => {
    (settingsApi.getEncryptionProgress as jest.Mock).mockResolvedValue(30);

    // Capture the socket callback
    let socketCallback:
      | ((data: EncryptionProgressSocketEvent) => void)
      | undefined;
    (SocketHelper.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === SocketEvents.EncryptionProgress) {
        socketCallback = callback;
      }
    });

    renderWithTheme(<EncryptionPortal />);

    await waitFor(
      () => {
        const progressText = screen.queryByText(/30\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Simulate socket event
    expect(socketCallback).toBeDefined();
    if (socketCallback) {
      socketCallback({ percentage: 75, error: null });

      await waitFor(
        () => {
          const progressText = screen.queryByText(/75\s*%/i);
          expect(progressText).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const progressBar = screen.getByTestId("encryption-progress-bar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "75");
      expect(progressBar).toHaveAttribute("data-percent", "75");
    }
  });

  test("handles socket error events", async () => {
    (settingsApi.getEncryptionProgress as jest.Mock).mockResolvedValue(30);

    // Capture the socket callback
    let socketCallback:
      | ((data: EncryptionProgressSocketEvent) => void)
      | undefined;
    (SocketHelper.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === SocketEvents.EncryptionProgress) {
        socketCallback = callback;
      }
    });

    renderWithTheme(<EncryptionPortal />);

    await waitFor(
      () => {
        const progressText = screen.queryByText(/30\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Simulate socket error event
    const socketError = "Socket Error";
    expect(socketCallback).toBeDefined();
    if (socketCallback) {
      socketCallback({ percentage: 100, error: socketError });

      await waitFor(
        () => {
          expect(screen.getByText(socketError)).toBeInTheDocument();
          expect(screen.getByText("Error")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const errorContainer = screen.getByTestId("encryption-portal-error");
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveAttribute("data-error", "true");
    }
  });
});
