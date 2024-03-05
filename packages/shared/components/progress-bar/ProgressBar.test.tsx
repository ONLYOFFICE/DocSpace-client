import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ProgressBar } from "./ProgressBar";

describe("<ProgressBar />", () => {
  it("renders without error", () => {
    render(<ProgressBar percent={50} label="Some work in progress" />);

    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });
});
