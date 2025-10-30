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

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContextMenu } from "../../../context-menu/ContextMenu";
import { ToolbarActionType } from "../../MediaViewer.enums";
import { ViewerToolbar } from "./index";
import type { ToolbarItemType } from "./ViewerToolbar.props";

const DotsIcon = () => <div data-testid="dots-icon">Dots</div>;

// Mock useClickOutside hook
jest.mock("../../../../utils/useClickOutside", () => ({
  useClickOutside: (ref: HTMLElement, callback: () => void) => {
    // Mock implementation that just stores the callback

    // biome-ignore lint/suspicious/noExplicitAny: TODO fix
    (window as any).clickOutsideCallback = callback;
  },
}));

// Mock classnames
jest.mock("classnames", () => ({
  __esModule: true,
  default: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("ViewerToolbar", () => {
  const mockToolbarEvent = jest.fn();
  const mockGenerateContextMenu = jest.fn();
  const mockSetIsOpenContextMenu = jest.fn();

  const defaultToolbarItems: ToolbarItemType[] = [
    {
      key: "zoom-in",
      percent: false,
      actionType: 1,
      render: <div />,
      noHover: undefined,
      disabled: undefined,
      onClick: undefined,
    },
    {
      key: "zoom-out",
      percent: false,
      actionType: 1,
      render: <div />,
      noHover: undefined,
      disabled: undefined,
      onClick: undefined,
    },
  ];

  const defaultProps = {
    toolbar: defaultToolbarItems,
    percentValue: 1,
    toolbarEvent: mockToolbarEvent,
    generateContextMenu: mockGenerateContextMenu,
    setIsOpenContextMenu: mockSetIsOpenContextMenu,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders toolbar with all items", () => {
    render(<ViewerToolbar {...defaultProps} />);

    defaultToolbarItems.forEach((item) => {
      const toolbarItem = screen.getByTestId(`toolbar-item-${item.key}`);
      expect(toolbarItem).toBeInTheDocument();
    });
  });

  it("handles toolbar item clicks", () => {
    render(<ViewerToolbar {...defaultProps} />);

    const zoomInButton = screen.getByTestId("toolbar-item-zoom-in");
    fireEvent.click(zoomInButton);

    expect(mockToolbarEvent).toHaveBeenCalledWith(defaultToolbarItems[0]);
  });

  it("handles context menu toggle", () => {
    const contextMenu = <div data-testid="context-menu">Context Menu</div>;
    mockGenerateContextMenu.mockReturnValue(contextMenu);
    const contextMenuModel = [
      {
        key: "item1",
        label: "Item 1",
        onClick: () => console.log("Item 1 clicked"),
      },
      {
        key: "item2",
        label: "Item 2",
        onClick: () => console.log("Item 2 clicked"),
      },
    ];
    const toolbarWithContextMenu = [
      ...defaultToolbarItems,
      {
        key: "context-menu",
        title: "More Options",
        icon: <DotsIcon />,
        actionType: ToolbarActionType.Panel,
        render: <ContextMenu model={contextMenuModel} />,
        onClick: () => console.log("Context menu clicked"),
        disabled: false,
      },
    ];

    render(
      <ViewerToolbar {...defaultProps} toolbar={toolbarWithContextMenu} />,
    );

    const contextMenuButton = screen.getByTestId("toolbar-item-context-menu");
    fireEvent.click(contextMenuButton);

    expect(mockSetIsOpenContextMenu).toHaveBeenCalled();
    expect(screen.getByTestId("context-menu")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-toolbar";
    render(<ViewerToolbar {...defaultProps} className={customClass} />);

    const toolbar = screen.getByTestId("viewer-toolbar");
    expect(toolbar).toHaveClass(customClass);
  });

  it("handles disabled items", () => {
    const toolbarWithDisabledItem = [
      ...defaultToolbarItems,
      {
        key: "disabled-item",
        title: "Disabled Item",
        icon: <div>Disabled</div>,
        actionType: ToolbarActionType.Download,
        render: <div>Disabled</div>,
        disabled: true,
        onClick: () => {},
      },
    ];

    render(
      <ViewerToolbar {...defaultProps} toolbar={toolbarWithDisabledItem} />,
    );

    expect(
      screen.queryByTestId("toolbar-item-disabled-item"),
    ).not.toBeInTheDocument();
  });

  it("renders custom content when render prop is provided", () => {
    const customContent = (
      <div data-testid="custom-content">Custom Content</div>
    );
    const toolbarWithCustomContent = [
      ...defaultToolbarItems,
      {
        key: "custom",
        title: "Custom Item",
        icon: <div>Icon</div>,
        render: customContent,
        actionType: ToolbarActionType.Download,
        onClick: () => console.log("Custom item clicked"),
        disabled: false,
      },
    ];

    render(
      <ViewerToolbar {...defaultProps} toolbar={toolbarWithCustomContent} />,
    );

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
  });
});
