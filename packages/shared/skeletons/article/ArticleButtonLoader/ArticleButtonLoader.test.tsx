import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ArticleButtonLoader } from ".";

describe("ArticleButtonLoader", () => {
  it("renders without crashing", () => {
    render(<ArticleButtonLoader />);
    expect(screen.getByTestId("article-button-loader")).toBeInTheDocument();
  });
});
