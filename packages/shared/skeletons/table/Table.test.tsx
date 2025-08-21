import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { TableSkeleton } from "./index";

describe("TableSkeleton", () => {
  it("renders with default count", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.getElementsByClassName("row");
    expect(rows).toHaveLength(25);
  });

  it("renders with custom count", () => {
    const { container } = render(<TableSkeleton count={5} />);
    const rows = container.getElementsByClassName("row");
    expect(rows).toHaveLength(5);
  });
});
