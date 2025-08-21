import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { InfiniteLoaderComponent } from "./InfiniteLoader";

const mockLoadMoreItems = jest.fn(() => Promise.resolve());

const defaultProps = {
  viewAs: "tile" as const,
  hasMoreFiles: true,
  filesLength: 100,
  itemCount: 20,
  loadMoreItems: mockLoadMoreItems,
  children: Array(20).fill(<div>Test Item</div>),
  itemSize: 50,
};

describe("InfiniteLoader Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<InfiniteLoaderComponent {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(<InfiniteLoaderComponent {...defaultProps} isLoading />);
    expect(
      screen.queryAllByTestId("infinite-loader-container-list").length,
    ).toBe(0);
    expect(
      screen.queryAllByTestId("infinite-loader-container-grid").length,
    ).toBe(0);
  });
});
