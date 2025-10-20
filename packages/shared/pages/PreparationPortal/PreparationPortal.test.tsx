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
import { screen, waitFor, act, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PreparationPortal } from "./index";
import SocketHelper, { SocketEvents } from "../../utils/socket";
import { getRestoreProgress } from "../../api/portal";

// Mock the i18next library
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

// Mock the API call
jest.mock("../../api/portal", () => ({
  getRestoreProgress: jest.fn(),
}));

// Mock the socket helper
jest.mock("../../utils/socket", () => ({
  __esModule: true,
  default: {
    on: jest.fn().mockReturnThis(),
  },
  SocketEvents: {
    RestoreProgress: "RESTORE_PROGRESS",
  },
}));

// Mock the utility functions
jest.mock("./PreparationPortal.utils", () => ({
  clearLocalStorage: jest.fn(),
  returnToPortal: jest.fn(),
}));

describe("<PreparationPortal />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", async () => {
    // Mock successful API response
    (getRestoreProgress as jest.Mock).mockResolvedValue({
      progress: 45,
      error: null,
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
    (getRestoreProgress as jest.Mock).mockResolvedValue({
      progress: 75,
      error: null,
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
    (getRestoreProgress as jest.Mock).mockResolvedValue({
      progress: 0,
      error: errorMessage,
    });

    render(<PreparationPortal />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Common:Error")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("handles socket events correctly", async () => {
    // Mock successful API response
    (getRestoreProgress as jest.Mock).mockResolvedValue({
      progress: 30,
      error: null,
    });

    // Setup socket callback capture
    type RestoreProgressPayload = {
      progress: number;
      isCompleted: boolean;
      error: string | null;
    };
    let socketCallback: ((payload: RestoreProgressPayload) => void) | undefined;
    (SocketHelper?.on as jest.Mock).mockImplementation(
      (event, callback: (p: RestoreProgressPayload) => void) => {
        if (event === SocketEvents.RestoreProgress) {
          socketCallback = callback;
        }
        return SocketHelper;
      },
    );

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
    (getRestoreProgress as jest.Mock).mockResolvedValue({
      progress: 45,
      error: null,
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
