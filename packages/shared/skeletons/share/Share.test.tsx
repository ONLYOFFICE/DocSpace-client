import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import ShareSkeleton from "./index";

describe("ShareSkeleton", () => {
  const mockT = (key: string) => key;

  it("renders shared links text", () => {
    render(<ShareSkeleton t={mockT} />);
    expect(screen.getByText("Common:SharedLinks")).toBeInTheDocument();
  });

  it("renders two row skeletons", () => {
    const { container } = render(<ShareSkeleton t={mockT} />);
    const rows = container.getElementsByClassName("row");
    expect(rows).toHaveLength(2);
  });

  it("renders title skeleton", () => {
    const { container } = render(<ShareSkeleton t={mockT} />);
    const title = container.getElementsByClassName("title");
    expect(title).toHaveLength(1);
  });
});
