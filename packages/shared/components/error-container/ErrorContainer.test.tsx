import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import ErrorContainer from "./ErrorContainer";

test("<ErrorContainer />: render without error", () => {
  render(<ErrorContainer id="error-container" />);

  expect(screen.queryByTestId("ErrorContainer")).toBeInTheDocument();
});

test("renders with props", () => {
  render(
    <ErrorContainer
      headerText="Some error has happened"
      bodyText="Try again later"
    />,
  );

  expect(screen.queryByText("Some error has happened")).toBeInTheDocument();
  expect(screen.queryByText("Try again later")).toBeInTheDocument();
});
