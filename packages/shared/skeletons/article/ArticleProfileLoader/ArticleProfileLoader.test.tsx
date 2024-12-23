import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../../utils/render-with-theme";
import { ArticleProfileLoader } from ".";

describe("ArticleProfileLoader", () => {
  const defaultProps = {
    showText: true,
  };

  it("renders without error", () => {
    renderWithTheme(<ArticleProfileLoader {...defaultProps} />);
    expect(screen.getByTestId("article-profile-loader")).toBeInTheDocument();
  });

  it("renders all RectangleSkeletons when showText is true", () => {
    renderWithTheme(<ArticleProfileLoader {...defaultProps} />);
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(3); // avatar, title, and option button
  });

  it("renders only avatar RectangleSkeleton when showText is false", () => {
    renderWithTheme(
      <ArticleProfileLoader {...defaultProps} showText={false} />,
    );
    const rectangles = screen.getAllByTestId("rectangle-skeleton");
    expect(rectangles).toHaveLength(1); // only avatar
  });

  it("applies custom className", () => {
    const className = "custom-class";
    renderWithTheme(
      <ArticleProfileLoader {...defaultProps} className={className} />,
    );
    expect(screen.getByTestId("article-profile-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    renderWithTheme(<ArticleProfileLoader {...defaultProps} style={style} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    renderWithTheme(<ArticleProfileLoader {...defaultProps} id={id} />);
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("sets data-show-text attribute to true when showText is true", () => {
    renderWithTheme(<ArticleProfileLoader {...defaultProps} showText />);
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "data-show-text",
      "true",
    );
  });

  it("sets data-show-text attribute to false when showText is false", () => {
    renderWithTheme(
      <ArticleProfileLoader {...defaultProps} showText={false} />,
    );
    expect(screen.getByTestId("article-profile-loader")).toHaveAttribute(
      "data-show-text",
      "false",
    );
  });
});
