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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModalDialog } from ".";
import { ModalDialogType } from "./ModalDialog.enums";

vi.mock("react-device-detect", () => ({
  isSafari: false,
  isTablet: false,
  isMobileOnly: false,
  isMobile: false,
}));

describe("ModalDialog", () => {
  const mockOnClose = vi.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal dialog with header, body and footer", () => {
    render(
      <ModalDialog {...defaultProps}>
        <ModalDialog.Header>Modal Header</ModalDialog.Header>
        <ModalDialog.Body>Modal Body Content</ModalDialog.Body>
        <ModalDialog.Footer>Modal Footer</ModalDialog.Footer>
      </ModalDialog>,
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body Content")).toBeInTheDocument();
    expect(screen.getByText("Modal Footer")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    render(
      <ModalDialog {...defaultProps}>
        <ModalDialog.Header>Modal Header</ModalDialog.Header>
        <ModalDialog.Body>Modal Body Content</ModalDialog.Body>
      </ModalDialog>,
    );

    const closeButton = screen.getByLabelText("close");
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not show close button when isCloseable is false", () => {
    render(
      <ModalDialog {...defaultProps} isCloseable={false}>
        <ModalDialog.Header>Modal Header</ModalDialog.Header>
        <ModalDialog.Body>Modal Body Content</ModalDialog.Body>
      </ModalDialog>,
    );

    const closeButton = screen.queryByLabelText("close");
    expect(closeButton).not.toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <ModalDialog {...defaultProps} isLoading>
        <ModalDialog.Body>Modal Body Content</ModalDialog.Body>
      </ModalDialog>,
    );

    const modal = screen.getByTestId("modal");
    const loaderElements = modal.getElementsByClassName("dialog-loader-header");
    expect(loaderElements.length).toBeGreaterThan(0);
    expect(screen.queryByText("Modal Body Content")).not.toBeInTheDocument();
  });

  it("renders container when containerVisible is true (aside only)", () => {
    render(
      <ModalDialog
        {...defaultProps}
        displayType={ModalDialogType.aside}
        containerVisible
      >
        <ModalDialog.Container>Container Content</ModalDialog.Container>
      </ModalDialog>,
    );

    expect(screen.getByText("Container Content")).toBeInTheDocument();
  });
});
