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
import { screen, fireEvent, render } from "@testing-library/react";

import { AdditionalResources } from ".";
import { DeviceType } from "../../../enums";

vi.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: vi.fn(),
}));

const defaultProps = {
  t: (key: string) => key,
  isSettingPaid: true,
  feedbackAndSupportEnabled: true,
  helpCenterEnabled: true,
  onSave: vi.fn(),
  onRestore: vi.fn(),
  isLoading: false,
  additionalResourcesIsDefault: false,
  deviceType: DeviceType.desktop,
};

describe("<AdditionalResources />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<AdditionalResources {...defaultProps} />);

    expect(screen.getByText("Common:AdditionalResources")).toBeInTheDocument();
    expect(screen.getByText("ShowFeedbackAndSupport")).toBeInTheDocument();
    expect(screen.getByText("ShowHelpCenter")).toBeInTheDocument();
  });

  it("disables checkboxes when isSettingPaid is false", () => {
    render(<AdditionalResources {...defaultProps} isSettingPaid={false} />);

    const feedbackCheckbox = screen.getByTestId("show-feedback-support");
    const helpCheckbox = screen.getByTestId("show-help-center");

    expect(feedbackCheckbox).toBeDisabled();
    expect(helpCheckbox).toBeDisabled();
  });

  it("updates state when checkboxes are clicked", () => {
    render(<AdditionalResources {...defaultProps} />);

    const feedbackCheckbox = screen.getByTestId("show-feedback-support");
    fireEvent.click(feedbackCheckbox);

    expect(feedbackCheckbox).not.toBeChecked();
  });

  it("calls onSave with correct parameters", () => {
    const onSave = vi.fn();
    render(<AdditionalResources {...defaultProps} onSave={onSave} />);

    // Toggle feedback checkbox
    const feedbackCheckbox = screen.getByTestId("show-feedback-support");
    fireEvent.click(feedbackCheckbox);

    // Click save button
    const saveButton = screen.getByTestId("additional-resources-save-button");
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(false, true);
  });

  it("shows reminder text when there are unsaved changes", () => {
    render(<AdditionalResources {...defaultProps} />);

    // Initially no reminder
    expect(
      screen.queryByText("Common:YouHaveUnsavedChanges"),
    ).not.toBeInTheDocument();

    // Toggle checkbox to create changes
    const feedbackCheckbox = screen.getByTestId("show-feedback-support");
    fireEvent.click(feedbackCheckbox);

    expect(
      screen.getByText("Common:YouHaveUnsavedChanges"),
    ).toBeInTheDocument();
  });

  it("disables restore button when additionalResourcesIsDefault is true", () => {
    render(
      <AdditionalResources {...defaultProps} additionalResourcesIsDefault />,
    );

    const restoreButton = screen.getByTestId(
      "additional-resources-cancel-button",
    );
    expect(restoreButton).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<AdditionalResources {...defaultProps} isLoading />);

    expect(
      screen.getByText("Common:YouHaveUnsavedChanges"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("additional-resources-cancel-button"),
    ).toBeDisabled();
  });

  it("calls onRestore when restore button is clicked", () => {
    const onRestore = vi.fn();
    render(<AdditionalResources {...defaultProps} onRestore={onRestore} />);

    const restoreButton = screen.getByTestId(
      "additional-resources-cancel-button",
    );
    fireEvent.click(restoreButton);

    expect(onRestore).toHaveBeenCalled();
  });

  it("updates checkboxes when props change", () => {
    const { rerender } = render(<AdditionalResources {...defaultProps} />);

    rerender(
      <AdditionalResources
        {...defaultProps}
        feedbackAndSupportEnabled={false}
        helpCenterEnabled={false}
      />,
    );

    const feedbackCheckbox = screen.getByTestId("show-feedback-support");
    const helpCheckbox = screen.getByTestId("show-help-center");

    expect(feedbackCheckbox).not.toBeChecked();
    expect(helpCheckbox).not.toBeChecked();
  });
});
