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
    expect(rectangle).toHaveAttribute("width", "calc(100% - 16px)");
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
