import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SectionHeaderSkeleton, SectionSubmenuSkeleton } from "./index";
import styles from "./Sections.module.scss";

describe("SectionHeaderSkeleton", () => {
  const defaultProps = {
    id: "test-header",
    className: "test-class",
    style: { margin: "10px" },
    title: "",
    borderRadius: "3px",
    backgroundColor: "#f8f9f9",
    foregroundColor: "#eee",
    backgroundOpacity: 1,
    foregroundOpacity: 1,
  };

  it("renders header container with correct styles", () => {
    render(<SectionHeaderSkeleton {...defaultProps} />);

    const container = screen.getByTestId("section-header-skeleton");
    expect(container).toHaveClass(styles.headerContainer);
    expect(container).toHaveStyle(defaultProps.style);
  });

  it("renders header boxes with correct structure", () => {
    render(<SectionHeaderSkeleton {...defaultProps} />);

    const box1 = screen.getByTestId("header-box-1");
    const box2 = screen.getByTestId("header-box-2");
    const spacer = screen.getByTestId("header-spacer");

    expect(box1).toHaveClass(styles.headerBox1);
    expect(box2).toHaveClass(styles.headerBox2);
    expect(spacer).toHaveClass(styles.headerSpacer);
  });

  it("renders rectangle skeletons with correct props", () => {
    render(<SectionHeaderSkeleton {...defaultProps} />);

    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(2); // One in box1 and two in box2
  });
});

describe("SectionSubmenuSkeleton", () => {
  const defaultProps = {
    id: "test-submenu",
    style: { margin: "10px" },
    title: "Test Submenu",
    className: "test-class",
  };

  it("renders submenu container with correct styles", () => {
    render(<SectionSubmenuSkeleton {...defaultProps} />);

    const container = screen.getByTestId("section-submenu-skeleton");
    expect(container).toHaveClass(styles.submenu);
    expect(container).toHaveStyle(defaultProps.style);
  });

  it("renders rectangle skeletons with correct dimensions", () => {
    render(<SectionSubmenuSkeleton {...defaultProps} />);

    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(2);

    const [rect1, rect2] = rectangles;
    expect(rect1).toHaveAttribute("width", "80");
    expect(rect2).toHaveAttribute("width", "115");
    expect(rect1).toHaveAttribute("height", "32");
    expect(rect2).toHaveAttribute("height", "32");
  });
});
