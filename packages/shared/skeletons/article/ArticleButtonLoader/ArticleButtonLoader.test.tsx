import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ArticleButtonLoader } from ".";

describe("ArticleButtonLoader", () => {
  it("renders without crashing", () => {
    render(<ArticleButtonLoader />);
    expect(screen.getByTestId("article-button-loader")).toBeInTheDocument();
  });
});
