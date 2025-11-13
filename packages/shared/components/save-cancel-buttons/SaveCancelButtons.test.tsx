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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SaveCancelButtons } from ".";

describe("<SaveCancelButtons />", () => {
  const defaultProps = {
    showReminder: true,
    reminderText: "You have unsaved changes",
    saveButtonLabel: "Save",
    cancelButtonLabel: "Cancel",
    onSaveClick: vi.fn(),
    onCancelClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error and has correct ARIA attributes", () => {
    render(<SaveCancelButtons {...defaultProps} />);

    const container = screen.getByTestId("save-cancel-buttons");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("role", "group");
    expect(container).toHaveAttribute("aria-label", "Save or cancel changes");

    const saveButton = screen.getByTestId("save-button");
    const cancelButton = screen.getByTestId("cancel-button");

    expect(saveButton).toHaveAttribute("aria-label", "Save");
    expect(cancelButton).toHaveAttribute("aria-label", "Cancel");
  });

  it("displays custom id and className", () => {
    render(
      <SaveCancelButtons
        {...defaultProps}
        id="custom-id"
        className="custom-class"
      />,
    );

    const container = screen.getByTestId("save-cancel-buttons");
    expect(container).toHaveAttribute("id", "custom-id");
    expect(container).toHaveClass("custom-class");
  });

  it("shows reminder text with correct ARIA attributes when showReminder is true", () => {
    render(<SaveCancelButtons {...defaultProps} />);

    const reminder = screen.getByTestId("save-cancel-reminder");
    expect(reminder).toBeInTheDocument();
    expect(reminder).toHaveAttribute("aria-live", "polite");
    expect(reminder).toHaveTextContent(defaultProps.reminderText);
  });

  it("hides reminder text when showReminder is false", () => {
    render(<SaveCancelButtons {...defaultProps} showReminder={false} />);
    expect(
      screen.queryByTestId("save-cancel-reminder"),
    ).not.toBeInTheDocument();
  });

  it("calls onSaveClick when save button is clicked", async () => {
    render(<SaveCancelButtons {...defaultProps} />);

    await userEvent.click(screen.getByTestId("save-button"));
    expect(defaultProps.onSaveClick).toHaveBeenCalledTimes(1);
  });

  it("calls onCancelClick when cancel button is clicked", async () => {
    render(<SaveCancelButtons {...defaultProps} />);

    await userEvent.click(screen.getByTestId("cancel-button"));
    expect(defaultProps.onCancelClick).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard events correctly", () => {
    render(<SaveCancelButtons {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });
    expect(defaultProps.onSaveClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onCancelClick).toHaveBeenCalledTimes(1);
  });

  it("disables save button when saveButtonDisabled is true", () => {
    render(<SaveCancelButtons {...defaultProps} saveButtonDisabled />);

    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
  });

  it("disables cancel button based on cancelEnable and showReminder", () => {
    render(
      <SaveCancelButtons
        {...defaultProps}
        showReminder={false}
        cancelEnable={false}
      />,
    );

    const cancelButton = screen.getByTestId("cancel-button");
    expect(cancelButton).toBeDisabled();
    expect(cancelButton).toHaveAttribute("aria-disabled", "true");
  });

  it("applies additional class names to buttons", () => {
    render(
      <SaveCancelButtons
        {...defaultProps}
        additionalClassSaveButton="extra-save"
        additionalClassCancelButton="extra-cancel"
      />,
    );

    const saveButton = screen.getByTestId("save-button");
    const cancelButton = screen.getByTestId("cancel-button");

    expect(saveButton).toHaveClass("save-button", "extra-save");
    expect(cancelButton).toHaveClass("cancel-button", "extra-cancel");
  });

  it("shows loading state when isSaving is true", () => {
    render(<SaveCancelButtons {...defaultProps} isSaving />);

    const saveButton = screen.getByTestId("save-button");
    expect(saveButton).toHaveAttribute("aria-busy", "true");
  });
});
