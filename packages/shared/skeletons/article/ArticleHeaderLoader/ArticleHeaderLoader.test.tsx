import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../../utils/render-with-theme";
import { ArticleHeaderLoader } from ".";

describe("ArticleHeaderLoader", () => {
  const defaultProps = {
    showText: true,
  };

  it("renders without error", () => {
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} />);
    expect(screen.getByTestId("article-header-loader")).toBeInTheDocument();
  });

  it("renders RectangleSkeleton component", () => {
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} />);
    expect(screen.getByTestId("rectangle-skeleton")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const className = "custom-class";
    renderWithTheme(
      <ArticleHeaderLoader {...defaultProps} className={className} />,
    );

    expect(screen.getByTestId("article-header-loader")).toHaveClass(className);
  });

  it("applies custom style", () => {
    const style = { margin: "20px" };
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} style={style} />);

    expect(screen.getByTestId("article-header-loader")).toHaveStyle(style);
  });

  it("applies custom id", () => {
    const id = "custom-id";
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} id={id} />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "id",
      id,
    );
  });

  it("sets data-show-text attribute to true when showText is true", () => {
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} showText />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "data-show-text",
      "true",
    );
  });

  it("sets data-show-text attribute to false when showText is false", () => {
    renderWithTheme(<ArticleHeaderLoader {...defaultProps} showText={false} />);

    expect(screen.getByTestId("article-header-loader")).toHaveAttribute(
      "data-show-text",
      "false",
    );
  });
});
