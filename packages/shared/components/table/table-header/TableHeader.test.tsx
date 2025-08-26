/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { useRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { SortByFieldName } from "../../../enums";

import { TableHeader } from "./TableHeader";
import type { TableHeaderProps } from "../Table.types";

const COLUMN_STORAGE_NAME = "jest-table-header-column-storage";
const COLUMN_INFO_PANEL_STORAGE_NAME = "jest-table-header-info-panel-storage";

const TableHeaderWithContainerRef = (
  args: Omit<TableHeaderProps, "containerRef">,
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div id="table-container" ref={containerRef}>
      <TableHeader {...args} containerRef={containerRef} />
    </div>
  );
};

const mockColumns = [
  {
    key: "Name",
    title: "Name",
    resizable: true,
    enable: true,
    default: true,
    sortBy: SortByFieldName.Name,
    minWidth: 210,
    onChange: () => {},
    onClick: () => {},
  },
  {
    key: "Type",
    title: "Type",
    enable: true,
    resizable: true,
    sortBy: SortByFieldName.Type,
    onChange: () => {},
    onClick: () => {},
  },
  {
    key: "Tags",
    title: "Tags",
    enable: true,
    resizable: true,
    sortBy: SortByFieldName.Tags,
    withTagRef: true,
    onChange: () => {},
    onClick: () => {},
  },
  {
    key: "Owner",
    title: "Owner",
    enable: true,
    resizable: true,
    sortBy: SortByFieldName.Author,
    onChange: () => {},
    onClick: () => {},
  },
];

const defaultProps = {
  containerRef: { current: null },
  columns: mockColumns,
  columnStorageName: COLUMN_STORAGE_NAME,
  columnInfoPanelStorageName: COLUMN_INFO_PANEL_STORAGE_NAME,
  sectionWidth: 1000,
  useReactWindow: false,
  showSettings: true,
};

describe("<TableHeader />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<TableHeader {...defaultProps} />);
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
  });

  it("renders all columns", () => {
    render(<TableHeader {...defaultProps} />);

    mockColumns.forEach((column) => {
      expect(screen.getByTestId(`column-${column.key}`)).toBeInTheDocument();
    });
  });

  it("renders settings if showSettings is true", () => {
    render(<TableHeader {...defaultProps} />);

    expect(screen.getByTestId(`settings-block`)).toBeInTheDocument();
  });

  it("does not render settings if showSettings is false", () => {
    render(<TableHeader {...defaultProps} />);

    expect(screen.queryByTestId(`settings-block`)).toBeInTheDocument();
  });

  it("sets columnStorageName to localStorage if infoPanelVisible is false (default)", () => {
    render(<TableHeaderWithContainerRef {...defaultProps} />);

    expect(localStorage.getItem(COLUMN_STORAGE_NAME)).not.toBeNull();
  });

  it("does not set columnStorageName to localStorage if infoPanelVisible is true", () => {
    render(<TableHeaderWithContainerRef {...defaultProps} infoPanelVisible />);

    expect(localStorage.getItem(COLUMN_STORAGE_NAME)).toBeNull();
  });

  it("sets columnInfoPanelStorageName to localStorage if infoPanelVisible is true", () => {
    render(<TableHeaderWithContainerRef {...defaultProps} infoPanelVisible />);

    expect(localStorage.getItem(COLUMN_INFO_PANEL_STORAGE_NAME)).not.toBeNull();
  });

  it("does not set columnInfoPanelStorageName to localStorage if infoPanelVisible is false (default)", () => {
    render(<TableHeaderWithContainerRef {...defaultProps} />);

    expect(localStorage.getItem(COLUMN_INFO_PANEL_STORAGE_NAME)).toBeNull();
  });

  it("pass settingsTitle to settings wrapper title attribute", () => {
    const settingsTitle = "Column Settings";
    render(<TableHeader {...defaultProps} settingsTitle={settingsTitle} />);

    expect(screen.getByTestId("settings-block")).toHaveAttribute(
      "title",
      settingsTitle,
    );
  });
});
