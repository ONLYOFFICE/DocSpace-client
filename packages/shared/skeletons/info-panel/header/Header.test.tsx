import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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
