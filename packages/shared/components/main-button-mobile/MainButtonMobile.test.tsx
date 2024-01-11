import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MainButtonMobile } from "./MainButtonMobile";

describe("<MainButtonMobile />", () => {
  it("renders without error", () => {
    render(<MainButtonMobile />);

    expect(screen.getByTestId("main-button-mobile")).toBeInTheDocument();
  });
});
