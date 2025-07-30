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
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../utils/render-with-theme";
import ConflictResolve from "./ConflictResolve";
import { ConflictResolveType } from "../../enums";

describe("ConflictResolve", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    isLoading: false,
    visible: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    messageText: "test-file.docx",
    selectActionText: "Select an action:",
    submitButtonLabel: "OK",
    cancelButtonLabel: "Cancel",
    overwriteTitle: "Overwrite",
    overwriteDescription: "Replace the existing file",
    duplicateTitle: "Duplicate",
    duplicateDescription: "Create a copy of the file",
    skipTitle: "Skip",
    skipDescription: "Skip this file",
    headerLabel: "Conflict Resolution",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders conflict resolve dialog with all options", () => {
    renderWithTheme(<ConflictResolve {...defaultProps} />);

    expect(screen.getByText("Conflict Resolution")).toBeInTheDocument();
    expect(screen.getByText("test-file.docx")).toBeInTheDocument();
    expect(screen.getByText("Select an action:")).toBeInTheDocument();

    expect(screen.getByText("Overwrite")).toBeInTheDocument();
    expect(screen.getByText("Replace the existing file")).toBeInTheDocument();

    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Create a copy of the file")).toBeInTheDocument();

    expect(screen.getByText("Skip")).toBeInTheDocument();
    expect(screen.getByText("Skip this file")).toBeInTheDocument();

    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    renderWithTheme(<ConflictResolve {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit with selected resolve type when OK button is clicked", async () => {
    renderWithTheme(<ConflictResolve {...defaultProps} />);

    // Default selection is Overwrite
    const okButton = screen.getByText("OK");
    await userEvent.click(okButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(ConflictResolveType.Overwrite);
  });

  it("changes selected resolve type when a different option is selected", async () => {
    renderWithTheme(<ConflictResolve {...defaultProps} />);

    // Find the Duplicate radio button and click it
    const duplicateRadio = screen.getByLabelText("Duplicate", { exact: false });
    await userEvent.click(duplicateRadio);

    // Click the OK button to submit
    const okButton = screen.getByText("OK");
    await userEvent.click(okButton);

    // Check that onSubmit was called with the Duplicate type
    expect(mockOnSubmit).toHaveBeenCalledWith(ConflictResolveType.Duplicate);
  });

  it("shows loading state when isLoading is true", () => {
    renderWithTheme(<ConflictResolve {...defaultProps} isLoading />);

    // Check that the loading indicator is present
    const modal = screen.getByTestId("modal");
    const loaderElements = modal.getElementsByClassName("dialog-loader-header");
    expect(loaderElements.length).toBeGreaterThan(0);
  });
});
