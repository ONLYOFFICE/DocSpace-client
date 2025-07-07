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

import { TableHeaderCell } from "./TableHeaderCell";
import { SortByFieldName } from "../../../../enums";

const mockColumn = {
  key: "name",
  title: "Name",
  enable: true,
  sortBy: SortByFieldName.Name,
  minWidth: 200,
  resizable: false,
  onClick: jest.fn(),
};

const defaultProps = {
  column: mockColumn,
  index: 0,
  onMouseDown: jest.fn(),
  resizable: false,
  sortBy: SortByFieldName.Author,
  sorted: true,
  sortingVisible: true,
};

describe("<TableHeaderCell />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<TableHeaderCell {...defaultProps} />);

    expect(screen.getByTestId("table-header-cell")).toBeInTheDocument();
  });

  it("renders checkbox if column has checkbox and its value is true", () => {
    render(
      <TableHeaderCell
        {...defaultProps}
        column={{
          ...mockColumn,
          checkbox: {
            value: true,
            isIndeterminate: false,
            onChange: () => {},
          },
        }}
      />,
    );

    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders with resize handle", () => {
    render(<TableHeaderCell {...defaultProps} resizable />);

    expect(screen.getByTestId("resize-handle")).toBeInTheDocument();
  });

  it("calls onMouseDown when resize handle is clicked", async () => {
    render(<TableHeaderCell {...defaultProps} resizable />);

    const resizeHandle = screen.getByTestId("resize-handle");
    await userEvent.click(resizeHandle);

    expect(defaultProps.onMouseDown).toHaveBeenCalled();
  });

  it("show sort icon if sortingVisible is true ", async () => {
    render(<TableHeaderCell {...defaultProps} sortingVisible />);

    expect(screen.getByTestId("sort-icon")).toBeInTheDocument();
  });

  it("doesn't show sort icon if sortingVisible is false", async () => {
    render(<TableHeaderCell {...defaultProps} sortingVisible={false} />);

    const tableHeaderCell = screen.getByTestId("table-header-cell");
    await userEvent.hover(tableHeaderCell);

    expect(screen.queryByTestId("sort-icon")).not.toBeInTheDocument();
  });

  it("pass defaultSize to data-default-size attribute", async () => {
    const defaultSize = 100;
    render(<TableHeaderCell {...defaultProps} defaultSize={defaultSize} />);

    expect(screen.getByTestId("table-header-cell")).toHaveAttribute(
      "data-default-size",
      String(defaultSize),
    );
  });

  it("generate correct id from index prop", async () => {
    const index = 3;
    render(<TableHeaderCell {...defaultProps} index={index} />);

    expect(screen.getByTestId("table-header-cell")).toHaveAttribute(
      "id",
      `column_${index}`,
    );
  });
});
