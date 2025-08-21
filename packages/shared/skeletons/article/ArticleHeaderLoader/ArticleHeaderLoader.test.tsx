import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ArticleHeaderLoader } from ".";

describe("ArticleHeaderLoader", () => {
  const defaultProps = {
    showText: true,
  };

  it("renders without error", () => {
    render(<ArticleHeaderLoader {...defaultProps} />);
    expect(screen.getByTestId("article-header-loader")).toBeInTheDocument();
  });

  it("renders RectangleSkeleton component", () => {
    render(<ArticleHeaderLoader {...defaultProps} />);
    expect(screen.getByTestId("rectangle-skeleton")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const className = "custom-class";
    render(<ArticleHeaderLoader {...defaultProps} className={className} />);

    expect(screen.getByTestId("article-header-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    render(<ArticleHeaderLoader {...defaultProps} style={style} />);

    expect(screen.getByTestId("article-header-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    render(<ArticleHeaderLoader {...defaultProps} id={id} />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("sets data-show-text attribute to true when showText is true", () => {
    render(<ArticleHeaderLoader {...defaultProps} showText />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "data-show-text",
      "true",
    );
  });

  it("sets data-show-text attribute to false when showText is false", () => {
    render(<ArticleHeaderLoader {...defaultProps} showText={false} />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "data-show-text",
      "false",
    );
  });
});
