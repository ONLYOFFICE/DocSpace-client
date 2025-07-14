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
import "@testing-library/jest-dom";

import { TableBody } from "./TableBody";
import { TableCell } from "../sub-components/table-cell";

jest.mock("../../infinite-loader", () => ({
  InfiniteLoaderComponent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="infinite-loader">{children}</div>
  ),
}));

describe("<TableBody />", () => {
  const defaultProps = {
    columnStorageName: "test-column-storage",
    columnInfoPanelStorageName: "test-info-panel-storage",
    filesLength: 10,
    itemCount: 20,
    fetchMoreFiles: jest.fn(),
    hasMoreFiles: true,
    useReactWindow: true,
    itemHeight: 50,
    children: [<TableCell key="1">Cell</TableCell>],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<TableBody {...defaultProps} />);
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("renders children in InfiniteLoaderComponent when useReactWindow is true (default)", () => {
    render(<TableBody {...defaultProps} />);

    expect(screen.getByTestId("infinite-loader")).toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("renders children without InfiniteLoaderComponent when useReactWindow is false", () => {
    const props = { ...defaultProps, useReactWindow: false };
    const { queryByTestId } = render(<TableBody {...props} />);

    expect(queryByTestId("infinite-loader")).not.toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });
});
