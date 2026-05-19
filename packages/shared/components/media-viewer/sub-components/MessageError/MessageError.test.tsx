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
import { render, screen, fireEvent } from "@testing-library/react";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

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
