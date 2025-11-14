import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import ShareSkeleton from "./index";
import styles from "./Share.module.scss";

describe("ShareSkeleton", () => {
  const mockT = (key: string) => key;

  it("renders shared links text", () => {
    render(<ShareSkeleton t={mockT} />);
    expect(screen.getByText("Common:SharedLinks")).toBeInTheDocument();
  });

  it("renders two row skeletons", () => {
    const { container } = render(<ShareSkeleton t={mockT} />);
    const rows = container.getElementsByClassName(styles.row);
    expect(rows).toHaveLength(2);
  });

  it("renders title skeleton", () => {
    const { container } = render(<ShareSkeleton t={mockT} />);
    const title = container.getElementsByClassName(styles.title);
    expect(title).toHaveLength(1);
  });
});
