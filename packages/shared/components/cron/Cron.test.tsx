import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Cron } from ".";

test("<Cron />: render without error", () => {
  render(<Cron value="* * * * *" setValue={() => {}} />);

  expect(screen.queryByTestId("cron")).toBeInTheDocument();
});
