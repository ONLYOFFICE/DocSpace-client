/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import BreadCrumbsLoader from "./BreadCrumbs";
import SearchLoader from "./Search";
import RowLoader from "./Row";
import styles from "./Row.module.scss";

describe("BreadCrumbsLoader", () => {
  const defaultProps = {
    id: "test-breadcrumbs",
    className: "test-class",
    style: { margin: "10px" },
  };

  it("renders breadcrumbs container with correct styles", () => {
    render(<BreadCrumbsLoader {...defaultProps} />);

    const container = screen.getByTestId("bread-crumbs-loader");
    expect(container).toBeInTheDocument();
  });

  it("renders correct number of rectangle skeletons", () => {
    render(<BreadCrumbsLoader {...defaultProps} />);

    const rectangles = screen.getAllByRole("img");
    expect(rectangles).toHaveLength(5); // 3 text blocks and 2 separators
  });
});

describe("SearchLoader", () => {
  const defaultProps = {
    id: "test-search",
    className: "test-class",
    style: { margin: "10px" },
  };

  it("renders search skeleton with correct dimensions", () => {
    render(<SearchLoader {...defaultProps} />);

    const rectangle = screen.getByRole("img");

    expect(rectangle).toHaveAttribute("height", "32px");
  });

  it("applies custom styles", () => {
    render(<SearchLoader {...defaultProps} />);

    const rectangle = screen.getByRole("img");
    expect(rectangle).toHaveStyle(defaultProps.style);
  });
});

describe("RowLoader", () => {
  const defaultProps = {
    id: "test-row",
    className: "test-class",
    style: { margin: "10px" },
    count: 3,
    isMultiSelect: true,
    isContainer: true,
  };

  it("renders row container with correct styles", () => {
    render(<RowLoader {...defaultProps} />);

    const container = screen.getByTestId("row-loader");
    expect(container).toHaveClass(styles.container);
  });

  it("renders correct number of rows", () => {
    render(<RowLoader {...defaultProps} />);

    const items = screen.getAllByRole("img");
    // Each row has 2 rectangles (avatar and text), and with multiSelect enabled, adds a checkbox
    // So each row has 3 rectangles
    expect(items).toHaveLength(defaultProps.count * 3);
  });
});
