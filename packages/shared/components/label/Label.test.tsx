import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Label } from ".";

const baseProps = {
  text: "First name:",
  title: "first name",
  htmlFor: "firstNameField",
  display: "block",
};

test("<Text />: renders without error", () => {
  render(<Label {...baseProps}>Test label</Label>);

  expect(screen.queryByTestId("label")).toBeInTheDocument();
});
