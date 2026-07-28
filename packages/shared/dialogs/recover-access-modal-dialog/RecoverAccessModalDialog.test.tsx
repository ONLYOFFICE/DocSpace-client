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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RecoverAccessModalDialog from "./RecoverAccessModalDialog";
import { sendRecoverRequest } from "../../api/settings";
import { toastr } from "@docspace/ui-kit/components/toast";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("../../api/settings", () => ({
  sendRecoverRequest: vi.fn(),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const sendRecoverRequestMock = vi.mocked(sendRecoverRequest);

describe("RecoverAccessModalDialog", () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    textBody: "Test body text",
    emailPlaceholderText: "Enter email",
    id: "test-modal",
  };

  const EMAIL_INPUT = "recover_access_modal_email_input";
  const EMAIL_CONTAINER = "recover_access_modal_email_container";
  const DESCRIPTION_INPUT = "recover_access_modal_description_textarea";
  const SUBMIT_BUTTON = "recover_access_modal_submit_button";
  const CLOSE_BUTTON = "recover_access_modal_close_button";
  const TEXT_BODY = "recover_access_modal_text";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<RecoverAccessModalDialog {...defaultProps} />);

    expect(screen.getByTestId(TEXT_BODY)).toHaveTextContent("Test body text");
    expect(screen.getByTestId(EMAIL_INPUT)).toHaveAttribute(
      "placeholder",
      "Enter email",
    );
  });

  it("validates email input", async () => {
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);

    // Test invalid email
    await userEvent.type(emailInput, "invalid-email");
    fireEvent.blur(emailInput);

    expect(screen.getByTestId(EMAIL_CONTAINER)).toHaveTextContent(
      "Common:IncorrectEmail",
    );

    // Test valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "valid@email.com");
    fireEvent.blur(emailInput);

    expect(screen.getByTestId(EMAIL_CONTAINER)).not.toHaveTextContent(
      "Common:IncorrectEmail",
    );
  });

  it("handles form submission successfully", async () => {
    sendRecoverRequestMock.mockResolvedValueOnce("Success message");
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const submitButton = screen.getByTestId(SUBMIT_BUTTON);

    await userEvent.type(emailInput, "test@email.com");
    await userEvent.type(descriptionInput, "Test description");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(sendRecoverRequestMock).toHaveBeenCalled();
      const calls = sendRecoverRequestMock.mock.calls;
      expect(calls[0][0]).toBe("test@email.com");
      expect(calls[0][1]).toBe("Test description");
    });
    expect(toastr.success).toHaveBeenCalledWith("Success message");
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles form submission error", async () => {
    const errorMessage = "Error message";
    sendRecoverRequestMock.mockRejectedValueOnce(errorMessage);
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const submitButton = screen.getByTestId(SUBMIT_BUTTON);

    await userEvent.type(emailInput, "test@email.com");
    await userEvent.type(descriptionInput, "Test description");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(sendRecoverRequestMock).toHaveBeenCalled();
      const calls = sendRecoverRequestMock.mock.calls;
      expect(calls[0][0]).toBe("test@email.com");
      expect(calls[0][1]).toBe("Test description");
      expect(toastr.error).toHaveBeenCalledWith(errorMessage);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it("disables inputs while loading", async () => {
    sendRecoverRequestMock.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const submitButton = screen.getByTestId(SUBMIT_BUTTON);

    await userEvent.type(emailInput, "test@email.com");
    await userEvent.type(descriptionInput, "Test description");
    await userEvent.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("clears form on close", () => {
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const closeButton = screen.getByTestId(CLOSE_BUTTON);

    fireEvent.change(emailInput, { target: { value: "test@email.com" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });

    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(emailInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");
  });
});
