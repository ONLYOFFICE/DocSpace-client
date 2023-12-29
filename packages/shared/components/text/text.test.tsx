import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Text } from ".";

test("<Text />: renders without error", () => {
  render(<Text>Test text</Text>);

  expect(screen.queryByTestId("text")).toBeInTheDocument();
});
