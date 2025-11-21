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
import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ViewSelector } from ".";
import { TViewSelectorOption } from "./ViewSelector.types";

vi.mock("react-svg", () => ({
  ReactSVG: () => <div data-testid="mocked-svg" />,
}));

const mockViewSettings: TViewSelectorOption[] = [
  {
    value: "row",
    icon: "rowIcon.svg",
    id: "row-view",
  },
  {
    value: "tile",
    icon: "tileIcon.svg",
    id: "tile-view",
  },
  {
    value: "compact",
    icon: "compactIcon.svg",
    id: "compact-view",
  },
];

const defaultProps = {
  isDisabled: false,
  isFilter: false,
  onChangeView: vi.fn(),
  viewAs: "row",
  viewSettings: mockViewSettings,
};

describe("<ViewSelector />", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders without error", () => {
    render(<ViewSelector {...defaultProps} />);
    expect(screen.getByTestId("view-selector")).toBeInTheDocument();
  });

  it("renders all view options", () => {
    render(<ViewSelector {...defaultProps} />);
    const icons = screen.getAllByTestId("view-selector-icon");
    expect(icons).toHaveLength(mockViewSettings.length);
  });

  it("calls onChangeView when clicking a view option", async () => {
    const onChangeView = vi.fn();
    render(<ViewSelector {...defaultProps} onChangeView={onChangeView} />);

    const icons = screen.getAllByTestId("view-selector-icon");
    const tileIcon = icons.find(
      (icon) => icon.getAttribute("data-view") === "tile",
    );
    await userEvent.click(tileIcon!);

    expect(onChangeView).toHaveBeenCalledWith("tile");
  });

  it("does not call onChangeView when disabled", async () => {
    const onChangeView = vi.fn();
    render(
      <ViewSelector {...defaultProps} onChangeView={onChangeView} isDisabled />,
    );

    const icons = screen.getAllByTestId("view-selector-icon");
    const tileIcon = icons.find(
      (icon) => icon.getAttribute("data-view") === "tile",
    );
    await userEvent.click(tileIcon!);

    expect(onChangeView).not.toHaveBeenCalled();
  });

  it("applies custom className and style", () => {
    const customStyle = { backgroundColor: "red" };
    render(
      <ViewSelector
        {...defaultProps}
        className="custom-class"
        style={customStyle}
      />,
    );

    const viewSelector = screen.getByTestId("view-selector");
    expect(viewSelector).toHaveClass("custom-class");
    expect(viewSelector).toHaveStyle(customStyle);
  });

  it("renders only one icon when isFilter is true", () => {
    render(<ViewSelector {...defaultProps} viewAs="row" isFilter />);

    const icons = screen.getAllByTestId("view-selector-icon");
    expect(icons).toHaveLength(1);
  });

  it("executes callback function when provided in viewSettings", async () => {
    const callback = vi.fn();
    const settingsWithCallback = [
      { ...mockViewSettings[0], callback },
      mockViewSettings[1],
    ];

    render(
      <ViewSelector
        {...defaultProps}
        viewAs="tile"
        viewSettings={settingsWithCallback}
      />,
    );

    const icons = screen.getAllByTestId("view-selector-icon");
    const rowIcon = icons.find(
      (icon) => icon.getAttribute("data-view") === "row",
    );
    await userEvent.click(rowIcon!);

    expect(callback).toHaveBeenCalled();
  });
});
