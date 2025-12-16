import React from "react";
import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";

import { ArticleFolderLoader } from ".";

describe("ArticleFolderLoader", () => {
  const defaultProps = {
    showText: true,
    isVisitor: false,
  };

  it("renders without error", () => {
    render(<ArticleFolderLoader {...defaultProps} />);
    expect(screen.getByTestId("article-folder-loader")).toBeInTheDocument();
  });

  it("renders correct number of blocks and rectangles for non-visitor", () => {
    render(<ArticleFolderLoader {...defaultProps} isVisitor={false} />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    const rectangles = screen.getAllByTestId("rectangle-skeleton");

    expect(blocks).toHaveLength(2);
    expect(rectangles).toHaveLength(6); // 3 rectangles in each block
  });

  it("renders correct number of blocks and rectangles for visitor", () => {
    render(<ArticleFolderLoader {...defaultProps} isVisitor />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    const rectangles = screen.getAllByTestId("rectangle-skeleton");

    expect(blocks).toHaveLength(2);
    expect(rectangles).toHaveLength(3); // 2 rectangles in first block, 1 in second
  });

  it("applies custom className", () => {
    const className = "custom-class";
    render(<ArticleFolderLoader {...defaultProps} className={className} />);

    expect(screen.getByTestId("article-folder-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    render(<ArticleFolderLoader {...defaultProps} style={style} />);

    expect(screen.getByTestId("article-folder-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    render(<ArticleFolderLoader {...defaultProps} id={id} />);

    expect(screen.getByTestId("article-folder-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("renders blocks with data-show-text attribute", () => {
    render(<ArticleFolderLoader {...defaultProps} showText />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    blocks.forEach((block) => {
      expect(block).toHaveAttribute("data-show-text", "true");
    });
  });

  it("renders blocks without data-show-text attribute", () => {
    render(<ArticleFolderLoader {...defaultProps} showText={false} />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    blocks.forEach((block) => {
      expect(block).toHaveAttribute("data-show-text", "false");
    });
  });
});
