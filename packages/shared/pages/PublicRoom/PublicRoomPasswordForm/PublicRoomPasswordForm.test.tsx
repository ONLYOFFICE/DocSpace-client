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
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { validatePublicRoomPassword } from "../../../api/rooms";
import { ValidationStatus } from "../../../enums";
import { toastr } from "../../../components/toast";

import PublicRoomPassword from ".";

jest.mock("../../../api/rooms", () => ({
  validatePublicRoomPassword: jest.fn(),
}));

jest.mock("../../../components/toast", () => ({
  toastr: {
    error: jest.fn(),
  },
}));

jest.mock("../../../utils/common", () => ({
  ...jest.requireActual("../../../utils/common"),
  frameCallCommand: jest.fn(),
}));

const mockT = (key: string) => key;

const defaultProps = {
  t: mockT,
  roomKey: "test-room-key",
  roomTitle: "Test Room",
  onSuccessValidationCallback: jest.fn(),
};

describe("PublicRoomPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<PublicRoomPassword {...defaultProps} />);

    expect(screen.getByText("Common:EnterPassword")).toBeInTheDocument();
    expect(screen.getByText("Common:NeedPassword:")).toBeInTheDocument();
    expect(screen.getByText("Test Room")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Common:Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Common:ContinueButton" }),
    ).toBeInTheDocument();
  });

  it("shows error message when submitting with empty password", async () => {
    render(<PublicRoomPassword {...defaultProps} />);

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Common:RequiredField")).toBeInTheDocument();
    });
  });

  it("calls validatePublicRoomPassword with correct parameters", async () => {
    (validatePublicRoomPassword as jest.Mock).mockResolvedValueOnce({
      status: ValidationStatus.Ok,
    });

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "test-password" } });

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(validatePublicRoomPassword).toHaveBeenCalledWith(
        "test-room-key",
        "test-password",
      );
    });
  });

  it("calls onSuccessValidationCallback when validation is successful", async () => {
    const successResponse = {
      status: ValidationStatus.Ok,
      data: { token: "test-token" },
    };
    (validatePublicRoomPassword as jest.Mock).mockResolvedValueOnce(
      successResponse,
    );

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "test-password" } });

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(defaultProps.onSuccessValidationCallback).toHaveBeenCalledWith(
        successResponse,
      );
    });
  });

  it("shows error message when password is incorrect", async () => {
    (validatePublicRoomPassword as jest.Mock).mockResolvedValueOnce({
      status: ValidationStatus.InvalidPassword,
    });

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "wrong-password" } });

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Common:IncorrectPassword")).toBeInTheDocument();
    });
  });

  it("shows toastr error when API call fails", async () => {
    const errorMessage = "Network error";
    (validatePublicRoomPassword as jest.Mock).mockRejectedValueOnce(
      errorMessage,
    );

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "test-password" } });

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(toastr.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("submits form when Enter key is pressed", async () => {
    (validatePublicRoomPassword as jest.Mock).mockResolvedValueOnce({
      status: ValidationStatus.Ok,
    });

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "test-password" } });
    fireEvent.keyDown(passwordInput, { key: "Enter" });

    await waitFor(() => {
      expect(validatePublicRoomPassword).toHaveBeenCalledWith(
        "test-room-key",
        "test-password",
      );
    });
  });

  it("disables input and button during loading state", async () => {
    // Mock a delayed response to test loading state
    (validatePublicRoomPassword as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ status: ValidationStatus.Ok }), 100);
        }),
    );

    render(<PublicRoomPassword {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText("Common:Password");
    fireEvent.change(passwordInput, { target: { value: "test-password" } });

    const continueButton = screen.getByRole("button", {
      name: "Common:ContinueButton",
    });
    fireEvent.click(continueButton);

    // Check that input and button are disabled during loading
    expect(passwordInput).toBeDisabled();
    expect(continueButton).toBeDisabled();

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(validatePublicRoomPassword).toHaveBeenCalled();
    });
  });
});
