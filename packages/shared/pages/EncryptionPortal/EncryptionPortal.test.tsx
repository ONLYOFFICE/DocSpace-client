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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, act, render } from "@testing-library/react";

import { EncryptionPortal } from "./index";
import styles from "./EncryptionPortal.module.scss";

import SocketHelper, { SocketEvents } from "../../utils/socket";
import * as settingsApi from "../../api/settings";

// Mock the socket helper
vi.mock("../../utils/socket", () => ({
  __esModule: true,
  default: {
    on: vi.fn(),
  },
  SocketEvents: {
    EncryptionProgress: "encryption-progress",
  },
}));

// Mock the settings API
vi.mock("../../api/settings", () => ({
  getEncryptionProgress: vi.fn().mockResolvedValue(50),
  getEncryptionSettings: vi.fn().mockResolvedValue({ status: 1 }),
}));

// Mock the utils
vi.mock("./EncryptionPortal.utils", () => ({
  returnToPortal: vi.fn(),
}));

// Mock the translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

describe("EncryptionPortal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // Add a test for the loader state
  it("renders loader when not ready", async () => {
    // Mock the useTranslation hook to return ready: false
    vi.doMock("react-i18next", () => ({
      useTranslation: () => ({
        t: (key: string) => key,
        ready: false,
      }),
    }));

    const { EncryptionPortal } = await import("./index");

    await act(async () => render(<EncryptionPortal />));

    expect(screen.getByTestId("preparation-portal-loader")).toBeInTheDocument();
    expect(screen.getByTestId("encryption-portal")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    // Restore the original mock
    vi.restoreAllMocks();
  });

  it("renders state initially", async () => {
    await act(async () => render(<EncryptionPortal />));

    const portalElement = screen.getByTestId("encryption-portal");
    expect(portalElement).toBeInTheDocument();
  });

  it("renders progress bar when encryption is in progress", async () => {
    vi.mocked(settingsApi.getEncryptionProgress).mockResolvedValue(50);

    await act(async () => render(<EncryptionPortal />));

    await waitFor(
      () => {
        const progressText = screen.queryByText(/50\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const progressBar = screen.getByTestId("encryption-progress-bar");
    const portalElement = screen.getByTestId("encryption-portal");
    const portalBody = screen.getByTestId("encryption-portal-body");

    expect(screen.getByText("EncryptionPortalSubtitle")).toBeInTheDocument();
    expect(screen.getByText("EncryptionPortalTitle")).toBeInTheDocument();

    expect(portalElement).toHaveAttribute("aria-busy", "false");
    expect(portalBody).toBeInTheDocument();
    expect(portalBody).toHaveAttribute("data-progress", "true");

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(progressBar).toHaveAttribute("data-percent", "50");
    expect(progressBar).toHaveAttribute("role", "progressbar");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    expect(progressBar).toHaveAttribute("aria-label", "Encryption Progress");
  });

  it("renders error message when API call fails", async () => {
    const errorMessage = "API Error";
    vi.mocked(settingsApi.getEncryptionProgress).mockRejectedValue({
      response: {
        data: {
          error: {
            message: errorMessage,
          },
        },
      },
    });

    await act(async () => render(<EncryptionPortal />));

    await waitFor(
      () => {
        expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
        expect(screen.getByText("Error")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const errorContainer = screen.getByTestId("encryption-portal-error");
    const portalElement = screen.getByTestId("encryption-portal");
    const portalBody = screen.getByTestId("encryption-portal-body");

    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute("data-error", "true");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");
    expect(portalElement).toHaveAttribute("aria-busy", "false");
    expect(portalElement).toHaveClass(styles.encryptionPortal);
    expect(portalElement).toHaveClass(styles.error);
    expect(portalBody).toHaveAttribute("data-error", "true");
  });

  it("updates progress via socket events", async () => {
    vi.mocked(settingsApi.getEncryptionProgress).mockResolvedValue(30);

    // Capture the socket callback
    let socketCallback:
      | ((data: { percentage: number; error: string | null }) => void)
      | undefined;
    vi.mocked(SocketHelper!.on).mockImplementation(
      (event, callback: unknown) => {
        if (event === SocketEvents.EncryptionProgress) {
          socketCallback = callback as (data: {
            percentage: number;
            error: string | null;
          }) => void;
        }
      },
    );

    await act(async () => render(<EncryptionPortal />));

    await waitFor(
      () => {
        const progressText = screen.queryByText(/30\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Simulate socket event
    expect(socketCallback).toBeDefined();
    act(() => {
      socketCallback?.({ percentage: 75, error: null });
    });

    await waitFor(
      () => {
        const progressText = screen.queryByText(/75\s*%/i);
        expect(progressText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const progressBar = screen.getByTestId("encryption-progress-bar");
    const portalBody = screen.getByTestId("encryption-portal-body");

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    expect(progressBar).toHaveAttribute("data-percent", "75");
    expect(progressBar).toHaveAttribute("role", "progressbar");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    expect(portalBody).toHaveAttribute("data-progress", "true");
  });

  it("handles socket error events", async () => {
    vi.mocked(settingsApi.getEncryptionProgress).mockResolvedValue(30);

    // Capture the socket callback
    let socketCallback:
      | ((data: { percentage: number; error: string | null }) => void)
      | undefined;
    vi.mocked(SocketHelper!.on).mockImplementation(
      (event, callback: unknown) => {
        if (event === SocketEvents.EncryptionProgress) {
          socketCallback = callback as (data: {
            percentage: number;
            error: string | null;
          }) => void;
        }
      },
    );

    await act(async () => render(<EncryptionPortal />));

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
    act(() => {
      socketCallback?.({ percentage: 100, error: socketError });
    });

    await waitFor(
      () => {
        expect(screen.getByText(socketError)).toBeInTheDocument();
        expect(screen.getByText("Error")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const errorContainer = screen.getByTestId("encryption-portal-error");
    const portalElement = screen.getByTestId("encryption-portal");
    const portalBody = screen.getByTestId("encryption-portal-body");

    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute("data-error", "true");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");
    expect(portalElement).toHaveAttribute("aria-busy", "false");
    expect(portalElement).toHaveClass(styles.encryptionPortal);
    expect(portalElement).toHaveClass(styles.error);
    expect(portalBody).toHaveAttribute("data-error", "true");
    expect(portalBody).toHaveAttribute("data-socket-error", "true");
  });
});
