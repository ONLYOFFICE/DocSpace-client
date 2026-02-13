import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { TableSkeleton } from "./index";
import styles from "./Table.module.scss";

describe("TableSkeleton", () => {
  it("renders with default count", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.getElementsByClassName(styles.row);
    expect(rows).toHaveLength(25);
  });

  it("renders with custom count", () => {
    const { container } = render(<TableSkeleton count={5} />);
    const rows = container.getElementsByClassName(styles.row);
    expect(rows).toHaveLength(5);
  });
});
