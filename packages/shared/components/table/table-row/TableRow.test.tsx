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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { TableRow } from "./TableRow";

const contextOptions = [
  {
    key: "edit",
    label: "Edit",
    onClick: () => console.log("Edit clicked"),
  },
  {
    key: "delete",
    label: "Delete",
    onClick: () => console.log("Delete clicked"),
  },
];

const mockFileContextClick = jest.fn();

jest.mock("../../context-menu", () => ({
  __esModule: true,
  ContextMenu: () => <div />,
}));

jest.mock(
  "classnames",
  () =>
    (...args: string[]) =>
      args.join(" "),
);

describe("<TableRow />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<TableRow>Table row</TableRow>);

    expect(screen.getByTestId("table-row")).toBeInTheDocument();
  });

  it("renders context menu button if there are contextOptions", () => {
    render(<TableRow contextOptions={contextOptions}>Table row</TableRow>);

    expect(screen.getByTestId("context-menu-button")).toBeInTheDocument();
  });

  it("doesn't render context menu button if contextOptions are empty", () => {
    render(<TableRow contextOptions={[]}>Table row</TableRow>);

    expect(screen.queryByTestId("context-menu-button")).not.toBeInTheDocument();
  });

  it("calls fileContextClick with false when context menu button is clicked", async () => {
    render(
      <TableRow
        contextOptions={contextOptions}
        fileContextClick={mockFileContextClick}
      >
        Table row
      </TableRow>,
    );

    const contextButton = screen.getByTestId("context-menu-button");
    await userEvent.click(contextButton);

    expect(mockFileContextClick).toHaveBeenCalledWith(false);
  });

  it("calls fileContextClick with true when right mouse button on table row clicked", async () => {
    render(
      <TableRow
        contextOptions={contextOptions}
        fileContextClick={mockFileContextClick}
      >
        Table row
      </TableRow>,
    );

    const tableRow = screen.getByTestId("table-row");
    await userEvent.pointer({ keys: "[MouseRight]", target: tableRow });

    expect(mockFileContextClick).toHaveBeenCalledWith(true);
  });

  it("calls onDoubleClick when double-click on table row", async () => {
    const onDoubleClick = jest.fn();

    render(<TableRow onDoubleClick={onDoubleClick}>Table row</TableRow>);

    const tableRow = screen.getByTestId("table-row");

    await userEvent.dblClick(tableRow);

    expect(onDoubleClick).toHaveBeenCalled();
  });

  it("calls onClick when click on table row", async () => {
    const onClick = jest.fn();

    render(<TableRow onClick={onClick}>Table row</TableRow>);

    const tableRow = screen.getByTestId("table-row");

    await userEvent.click(tableRow);

    expect(onClick).toHaveBeenCalled();
  });

  it("applies style prop to table row", () => {
    const style = { backgroundColor: "red" };

    render(<TableRow style={style}>Table row</TableRow>);

    const tableRow = screen.getByTestId("table-row");

    expect(tableRow).toHaveStyle("background-color: red");
  });

  it("passes contextMenuCellStyle as style to TableCell", () => {
    const contextMenuCellStyle = { backgroundColor: "blue" };

    render(
      <TableRow contextMenuCellStyle={contextMenuCellStyle}>
        Table row
      </TableRow>,
    );

    const cell = screen.getByTestId("table-cell");

    expect(cell).toHaveStyle("background-color: blue");
  });

  it("spreads selectionProp to TableCell", () => {
    const selectionProp = { className: "selected", value: "123" };

    render(<TableRow selectionProp={selectionProp}>Table row</TableRow>);

    const cell = screen.getByTestId("table-cell");

    expect(cell).toHaveClass("selected");
    expect(cell).toHaveAttribute("value", "123");
  });
});
