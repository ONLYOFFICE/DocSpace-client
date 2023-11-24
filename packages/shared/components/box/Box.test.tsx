import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Box } from ".";

test("<Box />: render without error", () => {
  render(<Box />);

  expect(screen.queryByTestId("box")).toBeInTheDocument();
});
