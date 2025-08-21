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
import { screen, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AdditionalResources } from ".";
import { DeviceType } from "../../../enums";

jest.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: jest.fn(),
}));

const defaultProps = {
  t: (key: string) => key,
  isSettingPaid: true,
  feedbackAndSupportEnabled: true,
  helpCenterEnabled: true,
  onSave: jest.fn(),
  onRestore: jest.fn(),
  isLoading: false,
  additionalResourcesIsDefault: false,
  deviceType: DeviceType.desktop,
};

describe("<AdditionalResources />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const onSave = jest.fn();
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
    const onRestore = jest.fn();
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
