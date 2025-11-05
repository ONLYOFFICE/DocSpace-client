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
import { render, screen, fireEvent } from "@testing-library/react";

import type { ContextMenuModel } from "../../../context-menu/ContextMenu.types";

import { MessageError } from ".";

describe("MessageError", () => {
  const mockOnMaskClick = vi.fn();
  const mockOnItemClick = vi.fn();

  const defaultProps = {
    errorTitle: "Test Error Message",
    isMobile: false,
    model: [
      {
        key: "download",
        label: "Download",
        icon: "download-icon.svg",
        onClick: mockOnItemClick,
        isSeparator: undefined,
      },
      {
        key: "delete",
        label: "Delete",
        icon: "delete-icon.svg",
        onClick: mockOnItemClick,
        isSeparator: undefined,
      },
    ] as ContextMenuModel[],
    onMaskClick: mockOnMaskClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error message correctly", () => {
    render(<MessageError {...defaultProps} />);

    expect(screen.getByTestId("message-error-container")).toBeInTheDocument();
    expect(screen.getByTestId("message-error-title")).toHaveTextContent(
      "Test Error Message",
    );
  });

  it("renders toolbar items for desktop view", () => {
    render(<MessageError {...defaultProps} />);

    expect(screen.getByTestId("message-error-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-download")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-delete")).toBeInTheDocument();
  });

  it("renders only delete and download buttons in mobile view", () => {
    render(<MessageError {...defaultProps} isMobile />);

    const toolbar = screen.getByTestId("message-error-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-download")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-item-delete")).toBeInTheDocument();
  });

  it("handles toolbar item clicks correctly", () => {
    render(<MessageError {...defaultProps} />);

    const downloadButton = screen.getByTestId("toolbar-item-download");
    fireEvent.click(downloadButton);

    expect(mockOnMaskClick).toHaveBeenCalledTimes(1);
    expect(mockOnItemClick).toHaveBeenCalledTimes(1);
  });

  it("filters out disabled items", () => {
    const propsWithDisabledItem = {
      ...defaultProps,
      model: [
        ...defaultProps.model,
        {
          key: "rename",
          label: "Rename",
          icon: "rename-icon.svg",
          onClick: mockOnItemClick,
          disabled: true,
          isSeparator: undefined,
        },
      ] as ContextMenuModel[],
    };

    render(<MessageError {...propsWithDisabledItem} />);

    expect(screen.queryByTestId("toolbar-item-rename")).not.toBeInTheDocument();
  });

  it("handles items without icons", () => {
    const propsWithNoIcon = {
      ...defaultProps,
      model: [
        ...defaultProps.model,
        {
          key: "noIcon",
          label: "No Icon",
          onClick: mockOnItemClick,
          isSeparator: undefined,
        },
      ] as ContextMenuModel[],
    };

    render(<MessageError {...propsWithNoIcon} />);

    expect(screen.queryByTestId("toolbar-item-noIcon")).not.toBeInTheDocument();
  });
});
