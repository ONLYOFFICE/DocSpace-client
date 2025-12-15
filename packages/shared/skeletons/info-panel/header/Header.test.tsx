import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import InfoPanelHeaderLoader from "./index";
import styles from "./Header.module.scss";

describe("InfoPanelHeaderLoader", () => {
  it("renders without crashing", () => {
    render(<InfoPanelHeaderLoader />);
    const header = screen.getByTestId("info-panel-header-loader");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass(styles.header);
  });
});
