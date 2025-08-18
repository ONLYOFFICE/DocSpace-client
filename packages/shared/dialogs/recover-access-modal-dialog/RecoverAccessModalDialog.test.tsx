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

import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import RecoverAccessModalDialog from "./RecoverAccessModalDialog";
import { sendRecoverRequest } from "../../api/settings";
import { toastr } from "../../components/toast";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

jest.mock("../../api/settings", () => ({
  sendRecoverRequest: jest.fn(),
}));

jest.mock("../../components/toast", () => ({
  toastr: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("RecoverAccessModalDialog", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
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
    jest.clearAllMocks();
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
    (sendRecoverRequest as jest.Mock).mockResolvedValueOnce("Success message");
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const submitButton = screen.getByTestId(SUBMIT_BUTTON);

    await userEvent.type(emailInput, "test@email.com");
    await userEvent.type(descriptionInput, "Test description");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(sendRecoverRequest).toHaveBeenCalledWith(
        "test@email.com",
        "Test description",
      );
      expect(toastr.success).toHaveBeenCalledWith("Success message");
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("handles form submission error", async () => {
    const errorMessage = "Error message";
    (sendRecoverRequest as jest.Mock).mockRejectedValueOnce(errorMessage);
    render(<RecoverAccessModalDialog {...defaultProps} />);

    const emailInput = screen.getByTestId(EMAIL_INPUT);
    const descriptionInput = screen.getByTestId(DESCRIPTION_INPUT);
    const submitButton = screen.getByTestId(SUBMIT_BUTTON);

    await userEvent.type(emailInput, "test@email.com");
    await userEvent.type(descriptionInput, "Test description");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(sendRecoverRequest).toHaveBeenCalledWith(
        "test@email.com",
        "Test description",
      );
      expect(toastr.error).toHaveBeenCalledWith(errorMessage);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("disables inputs while loading", async () => {
    (sendRecoverRequest as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}),
    ); // Never resolves
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
