import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import History from "./index";
import styles from "./History.module.scss";

describe("History Skeleton Components", () => {
  describe("History Row", () => {
    it("renders without crashing", () => {
      render(<History />);
      const row = screen.getAllByTestId("history-row");
      expect(row[0]).toBeInTheDocument();
      expect(row[0]).toHaveClass(styles.row);
      expect(row.length).toBe(4);
    });
  });
});
