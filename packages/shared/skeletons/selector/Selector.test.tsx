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
