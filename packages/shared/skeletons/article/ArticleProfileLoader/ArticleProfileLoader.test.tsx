import React from "react";
import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";

import { ArticleProfileLoader } from ".";

describe("ArticleProfileLoader", () => {
  const defaultProps = {
    showText: true,
  };

  it("renders without error", () => {
    render(<ArticleProfileLoader {...defaultProps} />);
    expect(screen.getByTestId("article-profile-loader")).toBeInTheDocument();
  });

  it("renders all RectangleSkeletons when showText is true", () => {
    render(<ArticleProfileLoader {...defaultProps} />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(3); // avatar, title, and option button
  });

  it("renders only avatar RectangleSkeleton when showText is false", () => {
    render(<ArticleProfileLoader {...defaultProps} showText={false} />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(1); // only avatar
  });

  it("applies custom className", () => {
    const className = "custom-class";
    render(<ArticleProfileLoader {...defaultProps} className={className} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    render(<ArticleProfileLoader {...defaultProps} style={style} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    render(<ArticleProfileLoader {...defaultProps} id={id} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("sets data-show-text attribute to true when showText is true", () => {
    render(<ArticleProfileLoader {...defaultProps} showText />);
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "data-show-text",
      "true",
    );
  });

  it("sets data-show-text attribute to false when showText is false", () => {
    render(<ArticleProfileLoader {...defaultProps} showText={false} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "data-show-text",
      "false",
    );
  });
});
