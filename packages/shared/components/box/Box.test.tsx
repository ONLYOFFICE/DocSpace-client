import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Box } from ".";

test("<Box />", () => {
  render(<Box testId="test" />);

  expect(screen.queryByTestId("test")).toBeInTheDocument();
});
