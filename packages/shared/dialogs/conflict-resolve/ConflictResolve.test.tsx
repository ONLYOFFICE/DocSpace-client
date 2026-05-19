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
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConflictResolve from "./ConflictResolve";
import { ConflictResolveType } from "../../enums";

describe("ConflictResolve", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

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
    vi.clearAllMocks();
  });

  it("renders conflict resolve dialog with all options", () => {
    render(<ConflictResolve {...defaultProps} />);

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
    render(<ConflictResolve {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit with selected resolve type when OK button is clicked", async () => {
    render(<ConflictResolve {...defaultProps} />);

    // Default selection is Overwrite
    const okButton = screen.getByText("OK");
    await userEvent.click(okButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(ConflictResolveType.Overwrite);
  });

  it("changes selected resolve type when a different option is selected", async () => {
    render(<ConflictResolve {...defaultProps} />);

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
    render(<ConflictResolve {...defaultProps} isLoading />);

    // Check that the loading indicator is present
    const modal = screen.getByTestId("conflict_resolve_dialog");
    const loaderElements = modal.getElementsByClassName("dialog-loader-header");
    expect(loaderElements.length).toBeGreaterThan(0);
  });
});
