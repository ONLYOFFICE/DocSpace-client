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
import { screen, waitFor, act, render } from "@testing-library/react";

import { PreparationPortal } from "./index";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import { getRestoreProgress } from "../../api/portal";

// Mock the i18next library
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

// Mock the API call
vi.mock("../../api/portal", () => ({
  getRestoreProgress: vi.fn(),
}));

// Mock the socket helper
vi.mock("@docspace/ui-kit/utils/socket", () => ({
  __esModule: true,
  default: {
    on: vi.fn().mockReturnThis(),
  },
  SocketEvents: {
    RestoreProgress: "RESTORE_PROGRESS",
  },
}));

// Mock the utility functions
vi.mock("./PreparationPortal.utils", () => ({
  clearLocalStorage: vi.fn(),
  returnToPortal: vi.fn(),
}));

describe("<PreparationPortal />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", async () => {
    // Mock successful API response
    vi.mocked(getRestoreProgress).mockResolvedValue({
      progress: 45,
      error: undefined,
    });

    render(<PreparationPortal />);

    // Wait for the component to load and make API call
    await waitFor(() => {
      expect(getRestoreProgress).toHaveBeenCalled();
    });

    // Check if the component renders correctly
    expect(
      screen.getByText("Common:PreparationPortalTitle"),
    ).toBeInTheDocument();
  });

  it("displays progress correctly", async () => {
    // Mock successful API response with progress
    vi.mocked(getRestoreProgress).mockResolvedValue({
      progress: 75,
      error: undefined,
    });

    render(<PreparationPortal />);

    // Wait for the progress to be displayed
    await waitFor(() => {
      expect(
        screen.getByText("Common:PreparationPortalDescription"),
      ).toBeInTheDocument();
    });
  });

  it("handles error state correctly", async () => {
    const errorMessage = "Test error message";

    // Mock API response with error
    vi.mocked(getRestoreProgress).mockResolvedValue({
      progress: 0,
      error: {
        message: errorMessage,
      },
    });

    render(<PreparationPortal />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Common:Error")).toBeInTheDocument();
    });
  });

  it("handles socket events correctly", async () => {
    // Mock successful API response
    vi.mocked(getRestoreProgress).mockResolvedValue({
      progress: 30,
      error: undefined,
    });

    // Setup socket callback capture
    type RestoreProgressPayload = {
      progress: number;
      isCompleted: boolean;
      error: string | null;
    };
    let socketCallback: ((payload: RestoreProgressPayload) => void) | undefined;
    vi.mocked(SocketHelper!.on).mockImplementation((event, callback) => {
      if (event === SocketEvents.RestoreProgress) {
        socketCallback = callback as (payload: RestoreProgressPayload) => void;
      }
      return SocketHelper;
    });

    render(<PreparationPortal />);

    // Wait for the component to register socket listener
    await waitFor(() => {
      expect(SocketHelper?.on).toHaveBeenCalledWith(
        SocketEvents.RestoreProgress,
        expect.any(Function),
      );
    });

    act(() => {
      socketCallback!({ progress: 50, isCompleted: false, error: null });
    });

    // Check if progress was updated
    await waitFor(() => {
      expect(
        screen.getByText("Common:PreparationPortalDescription"),
      ).toBeInTheDocument();
    });
  });

  it("respects withoutHeader prop", async () => {
    // Mock successful API response
    vi.mocked(getRestoreProgress).mockResolvedValue({
      progress: 45,
      error: undefined,
    });

    render(<PreparationPortal withoutHeader />);

    // With withoutHeader prop, the header text should not be present
    await waitFor(() => {
      expect(
        screen.queryByText("Common:PreparationPortalTitle"),
      ).not.toBeInTheDocument();
    });
  });
});
