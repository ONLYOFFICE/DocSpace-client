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
import { render, fireEvent, screen } from "@testing-library/react";
import { ContextMenuRefType } from "../../context-menu/ContextMenu.types";
import { FolderTile } from "./FolderTile";
import { FolderTileProps } from "./FolderTile.types";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock styles
jest.mock("./FolderTile.module.scss", () => ({
  folderTile: "folderTile",
  showHotkeyBorder: "showHotkeyBorder",
  isDragging: "isDragging",
  isActive: "isActive",
  isEdit: "isEdit",
  iconContainer: "iconContainer",
  inProgress: "inProgress",
  icon: "icon",
  checked: "checked",
  loader: "loader",
  content: "content",
  optionButton: "optionButton",
  expandButton: "expandButton",
}));

// Mock context menu components
jest.mock("@docspace/shared/components/context-menu-button", () => ({
  ContextMenuButton: ({
    title,
    onClick,
  }: {
    title: string;
    onClick: (e: React.MouseEvent) => void;
  }) => (
    <button
      type="button"
      data-testid="context-menu-button"
      title={title}
      onClick={onClick}
    >
      Actions
    </button>
  ),
  ContextMenuButtonDisplayType: {
    toggle: "toggle",
  },
}));

jest.mock("@docspace/shared/components/context-menu", () => {
  const ContextMenuComponent = ({
    ref,
    model,
  }: {
    model?: Array<{ key: string; label: string }>;
  } & {
    ref: React.RefObject<ContextMenuRefType>;
  }) => {
    React.useImperativeHandle(ref, () => ({
      show: jest.fn(),
      hide: jest.fn(),
      toggle: jest.fn(),
      menuRef: { current: null },
    }));

    return (
      <div data-testid="context-menu">
        {model?.map((item) => <div key={item.key}>{item.label}</div>)}
      </div>
    );
  };
  ContextMenuComponent.displayName = "ContextMenu";
  return { ContextMenu: ContextMenuComponent };
});

// Mock Checkbox component
jest.mock("@docspace/shared/components/checkbox", () => ({
  Checkbox: ({
    isChecked,
    onChange,
    isIndeterminate,
  }: {
    isChecked?: boolean;
    isIndeterminate?: boolean;
    onChange?: (e: { target: { checked: boolean } }) => void;
  }) => (
    <input
      type="checkbox"
      checked={isChecked}
      data-indeterminate={isIndeterminate}
      onChange={() => onChange?.({ target: { checked: !isChecked } })}
      data-testid="checkbox"
    />
  ),
}));

describe("FolderTile", () => {
  const mockItem = {
    id: "1",
    title: "Test Folder",
  };

  const mockContextOptions = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  const FolderContent = () => (
    <div data-testid="folder-content" className="item-file-name">
      {mockItem.title}
    </div>
  );

  const renderFolderTile = (props: Partial<FolderTileProps> = {}) => {
    const defaultProps: FolderTileProps = {
      item: mockItem,
      contextOptions: mockContextOptions,
      element: <div data-testid="folder-icon">Folder Icon</div>,
      children: <FolderContent />,
      onSelect: jest.fn(),
      setSelection: jest.fn(),
      withCtrlSelect: jest.fn(),
      withShiftSelect: jest.fn(),
      tileContextClick: jest.fn(),
      hideContextMenu: jest.fn(),
      getContextModel: jest.fn(),
      ...props,
    };

    return render(<FolderTile {...defaultProps} />);
  };

  it("renders folder title correctly", () => {
    renderFolderTile();
    expect(screen.getByTestId("folder-content")).toBeTruthy();
    expect(screen.getByTestId("folder-content").textContent).toBe(
      "Test Folder",
    );
  });

  it("shows checkbox with correct state", () => {
    renderFolderTile({ checked: true });
    const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
  });

  it("shows indeterminate checkbox state", () => {
    renderFolderTile({ indeterminate: true });
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeTruthy();
    expect(checkbox.getAttribute("data-indeterminate")).toBe("true");
  });

  it("calls onSelect when checkbox is clicked", () => {
    const onSelect = jest.fn();
    renderFolderTile({ onSelect });

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalledWith(true, mockItem);
  });

  it("shows loader when inProgress is true", () => {
    renderFolderTile({ inProgress: true });
    const loader = screen.getByTestId("loader");
    expect(loader).toBeTruthy();
  });

  it("calls withCtrlSelect when Ctrl+Click", () => {
    const withCtrlSelect = jest.fn();
    renderFolderTile({ withCtrlSelect });

    const folderTile = screen.getByTestId("folder-content");
    fireEvent.click(folderTile, { ctrlKey: true });

    expect(withCtrlSelect).toHaveBeenCalledWith(mockItem);
  });

  it("calls withShiftSelect when Shift+Click", () => {
    const withShiftSelect = jest.fn();
    renderFolderTile({ withShiftSelect });

    const folderTile = screen.getByTestId("folder-content");
    fireEvent.click(folderTile, { shiftKey: true });

    expect(withShiftSelect).toHaveBeenCalledWith(mockItem);
  });

  it("renders badges when provided", () => {
    const badges = <div data-testid="test-badge">Badge</div>;
    renderFolderTile({ badges });
    expect(screen.getByTestId("test-badge")).toBeTruthy();
  });

  it("shows hotkey border when showHotkeyBorder is true", () => {
    const { container } = renderFolderTile({ showHotkeyBorder: true });
    expect(container.querySelector(".showHotkeyBorder")).toBeTruthy();
  });
});
