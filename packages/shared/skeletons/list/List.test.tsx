import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import ListLoader from "./index";
import ListItemLoader from "./List.item";
import styles from "./List.module.scss";

describe("ListLoader", () => {
  it("renders with default count", () => {
    render(<ListLoader count={25} />);
    const items = screen.getAllByTestId("list-item-loader");
    expect(items).toHaveLength(25); // Default count is 25
  });

  it("renders with custom count", () => {
    render(<ListLoader count={5} />);
    const items = screen.getAllByTestId("list-item-loader");
    expect(items).toHaveLength(5);
  });

  it("applies list class", () => {
    render(<ListLoader count={5} />);
    const list = screen.getByTestId("list-loader");
    expect(list).toHaveClass(styles.list);
  });
});

describe("ListItemLoader", () => {
  it("renders with all rectangles by default", () => {
    render(<ListItemLoader />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(4); // First, content, row, and last rectangles
  });

  it("renders without first rectangle", () => {
    render(<ListItemLoader withoutFirstRectangle />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(3);
  });

  it("renders without last rectangle", () => {
    render(<ListItemLoader withoutLastRectangle />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(3);
  });

  it("renders without both first and last rectangles", () => {
    render(<ListItemLoader withoutFirstRectangle withoutLastRectangle />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(2);
  });

  it("applies row class and modifiers", () => {
    render(<ListItemLoader withoutFirstRectangle withoutLastRectangle />);
    const row = screen.getByTestId("list-item-loader");
    expect(row).toHaveClass(styles.row);
    expect(row).toHaveClass(styles.withoutFirstRectangle);
    expect(row).toHaveClass(styles.withoutLastRectangle);
  });

  it("applies custom className", () => {
    const customClass = "custom-class";
    render(<ListItemLoader className={customClass} />);
    const row = screen.getByTestId("list-item-loader");
    expect(row).toHaveClass(customClass);
  });

  it("applies custom style", () => {
    const customStyle = { backgroundColor: "red" };
    render(<ListItemLoader style={customStyle} />);
    const row = screen.getByTestId("list-item-loader");
    expect(row).toHaveStyle(customStyle);
  });
});
