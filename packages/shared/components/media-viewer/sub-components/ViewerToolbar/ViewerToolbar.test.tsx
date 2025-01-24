// (c) Copyright Ascensio System SIA 2009-2024
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
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ViewerToolbar } from "./index";
import type { ToolbarItemType } from "./ViewerToolbar.props";

const DotsIcon = () => <div data-testid="dots-icon">Dots</div>;

// Mock useClickOutside hook
jest.mock("../../../../utils/useClickOutside", () => ({
  useClickOutside: (ref: any, callback: () => void) => {
    // Mock implementation that just stores the callback
    (window as any).clickOutsideCallback = callback;
  },
}));

// Mock classnames
jest.mock("classnames", () => ({
  __esModule: true,
  default: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("ViewerToolbar", () => {
  const mockToolbarEvent = jest.fn();
  const mockGenerateContextMenu = jest.fn();
  const mockSetIsOpenContextMenu = jest.fn();

  const defaultToolbarItems: ToolbarItemType[] = [
    {
      key: "zoom-in",
      title: "Zoom In",
      icon: <div data-testid="zoom-in-icon">Zoom In</div>,
    },
    {
      key: "zoom-out",
      title: "Zoom Out",
      icon: <div data-testid="zoom-out-icon">Zoom Out</div>,
    },
    {
      key: "fit-to-page",
      title: "Fit to Page",
      icon: <div data-testid="fit-page-icon">Fit to Page</div>,
    },
    {
      key: "zoom",
      title: "Zoom",
      percent: true,
      icon: <div data-testid="zoom-icon">Zoom</div>,
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
      expect(toolbarItem).toHaveAttribute("aria-label", item.title);
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

    const toolbarWithContextMenu = [
      ...defaultToolbarItems,
      {
        key: "context-menu",
        title: "More Options",
        icon: <DotsIcon />,
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
        disabled: true,
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
      },
    ];

    render(
      <ViewerToolbar {...defaultProps} toolbar={toolbarWithCustomContent} />,
    );

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
  });
});
