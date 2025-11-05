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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GroupMenuItem } from "./GroupMenuItem";

const mockItem = {
  label: "Menu Item",
  disabled: false,
  onClick: vi.fn(),
  iconUrl: "",
  title: "Menu Item Title",
  id: "group-menu-item",
};

const mockItemWithDropDown = {
  ...mockItem,
  withDropDown: true,
  options: [
    {
      key: "option-1",
      label: "Option 1",
      onClick: () => {},
    },
    {
      key: "option-2",
      label: "Option 2",
      onClick: () => {},
    },
  ],
};

vi.mock("../../../drop-down", () => ({
  __esModule: true,
  DropDown: () => <div data-testid="dropdown" />,
}));

describe("<GroupMenuItem />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<GroupMenuItem item={mockItem} />);

    expect(screen.getByTestId("group-menu-item")).toBeInTheDocument();
  });

  it("renders nothing if item is disabled", () => {
    render(<GroupMenuItem item={{ ...mockItem, disabled: true }} />);

    expect(screen.queryByTestId("group-menu-item")).not.toBeInTheDocument();
  });

  it("renders dropdown if item has withDropDown: true", () => {
    render(<GroupMenuItem item={mockItemWithDropDown} />);

    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });

  it("calls item's onClick when button is clicked", async () => {
    render(<GroupMenuItem item={mockItem} />);

    const button = screen.getByTestId("group-menu-item-button");

    await userEvent.click(button);

    expect(mockItem.onClick).toHaveBeenCalled();
  });

  it("doesn't call item's onClick when button is clicked and isBlocked passed", async () => {
    render(<GroupMenuItem item={mockItem} isBlocked />);

    const button = screen.getByTestId("group-menu-item-button");

    await userEvent.click(button);

    expect(mockItem.onClick).not.toHaveBeenCalled();
  });
});
