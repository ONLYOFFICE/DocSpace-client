import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../../utils/render-with-theme";
import { ArticleFolderLoader } from ".";

describe("ArticleFolderLoader", () => {
  const defaultProps = {
    showText: true,
    isVisitor: false,
  };

  it("renders without error", () => {
    renderWithTheme(<ArticleFolderLoader {...defaultProps} />);
    expect(screen.getByTestId("article-folder-loader")).toBeInTheDocument();
  });

  it("renders correct number of blocks and rectangles for non-visitor", () => {
    renderWithTheme(
      <ArticleFolderLoader {...defaultProps} isVisitor={false} />,
    );

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    const rectangles = screen.getAllByTestId("rectangle-skeleton");

    expect(blocks).toHaveLength(2);
    expect(rectangles).toHaveLength(6); // 3 rectangles in each block
  });

  it("renders correct number of blocks and rectangles for visitor", () => {
    renderWithTheme(<ArticleFolderLoader {...defaultProps} isVisitor />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    const rectangles = screen.getAllByTestId("rectangle-skeleton");

    expect(blocks).toHaveLength(2);
    expect(rectangles).toHaveLength(3); // 2 rectangles in first block, 1 in second
  });

  it("applies custom className", () => {
    const className = "custom-class";
    renderWithTheme(
      <ArticleFolderLoader {...defaultProps} className={className} />,
    );

    expect(screen.getByTestId("article-folder-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    renderWithTheme(<ArticleFolderLoader {...defaultProps} style={style} />);

    expect(screen.getByTestId("article-folder-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    renderWithTheme(<ArticleFolderLoader {...defaultProps} id={id} />);

    expect(screen.getByTestId("article-folder-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("renders blocks with data-show-text attribute", () => {
    renderWithTheme(<ArticleFolderLoader {...defaultProps} showText />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    blocks.forEach((block) => {
      expect(block).toHaveAttribute("data-show-text", "true");
    });
  });

  it("renders blocks without data-show-text attribute", () => {
    renderWithTheme(<ArticleFolderLoader {...defaultProps} showText={false} />);

    const blocks = screen.getAllByTestId("article-folder-loader-block");
    blocks.forEach((block) => {
      expect(block).toHaveAttribute("data-show-text", "false");
    });
  });
});
