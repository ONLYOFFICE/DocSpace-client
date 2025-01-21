import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { FilterLoader } from "./Filter";
import FilterBlockLoader from "./FilterBlock";
import styles from "./Filter.module.scss";

describe("Filter Skeleton Components", () => {
  describe("FilterLoader", () => {
    it("renders without crashing", () => {
      render(<FilterLoader />);
      const skeleton = screen.getByTestId("filter-loader");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass(styles.filterLoader);
    });

    it("applies custom className", () => {
      const customClass = "custom-class";
      render(<FilterLoader className={customClass} />);
      const skeleton = screen.getByTestId("filter-loader");
      expect(skeleton).toHaveClass(customClass);
      expect(skeleton).toHaveClass(styles.filterLoader);
    });
  });

  describe("FilterBlockLoader", () => {
    it("renders without crashing", () => {
      render(<FilterBlockLoader />);
      const container = screen.getByTestId("filter-block-loader");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass(styles.filterContainer);
    });
  });
});
