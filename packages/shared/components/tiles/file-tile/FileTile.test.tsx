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
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { FileType } from "../../../enums";

import { FileTile } from "./FileTile";
import { FileItemType } from "./FileTile.types";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock ReactSVG component
vi.mock("react-svg", () => ({
  ReactSVG: () => <div data-testid="mock-svg" />,
}));

// Mock styles - return default export for CSS Modules
vi.mock("./FileTile.module.scss", () => ({
  default: {
    fileTile: "fileTile",
    isBlockingOperation: "isBlockingOperation",
    showHotkeyBorder: "showHotkeyBorder",
    highlight: "highlight",
    loader: "loader",
    icons: "icons",
    iconContainer: "iconContainer",
  },
}));

// Mock Checkbox component
vi.mock("@docspace/shared/components/checkbox", () => ({
  Checkbox: ({
    isChecked,
    onChange,
  }: {
    isChecked?: boolean;
    onChange?: (e: { target: { checked: boolean } }) => void;
  }) => (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={() => onChange?.({ target: { checked: !isChecked } })}
      data-testid="checkbox"
    />
  ),
}));

describe("FileTile", () => {
  const mockItem: FileItemType = {
    id: "1",
    title: "Test File",
    fileExst: ".docx",
    fileType: FileType.Document,
  };

  const mockContextOptions = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  const defaultProps = {
    item: mockItem,
    contextOptions: mockContextOptions,
    element: <div data-testid="file-icon">File Icon</div>,
  };

  const FileContent = () => (
    <div data-testid="file-content" className="item-file-name">
      {mockItem.title}
    </div>
  );

  it("renders file title correctly", () => {
    render(
      <FileTile {...defaultProps}>
        <FileContent />
      </FileTile>,
    );
    expect(screen.getByTestId("file-content")).toBeTruthy();
    expect(screen.getByTestId("file-content").textContent).toBe("Test File");
  });

  it("shows checkbox when checked prop is provided", () => {
    render(
      <FileTile {...defaultProps} checked>
        <FileContent />
      </FileTile>,
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
  });

  it("calls onSelect when checkbox is clicked", () => {
    const onSelect = vi.fn();
    render(
      <FileTile {...defaultProps} onSelect={onSelect}>
        <FileContent />
      </FileTile>,
    );

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalledWith(true, mockItem);
  });

  it("shows loader when inProgress is true", () => {
    render(
      <FileTile {...defaultProps} inProgress>
        <FileContent />
      </FileTile>,
    );
    const loader = screen.getByTestId("loader");
    expect(loader).toBeTruthy();
  });

  it("calls thumbnailClick when thumbnail is clicked", () => {
    const thumbnailClick = vi.fn();
    render(
      <FileTile
        {...defaultProps}
        thumbnailClick={thumbnailClick}
        thumbnail="test.png"
      >
        <FileContent />
      </FileTile>,
    );

    const thumbnail = screen.getByTestId("file-thumbnail");
    fireEvent.click(thumbnail);

    expect(thumbnailClick).toHaveBeenCalled();
  });

  it("renders badges when provided", () => {
    const badges = <div data-testid="test-badge">Badge</div>;
    render(
      <FileTile {...defaultProps} badges={badges}>
        <FileContent />
      </FileTile>,
    );
    expect(screen.getByTestId("test-badge")).toBeTruthy();
  });

  it("shows hotkey border when showHotkeyBorder is true", () => {
    const { container } = render(
      <FileTile {...defaultProps} showHotkeyBorder>
        <FileContent />
      </FileTile>,
    );
    const element = container.querySelector("[class*='showHotkeyBorder']");
    expect(element).toBeTruthy();
  });
});
