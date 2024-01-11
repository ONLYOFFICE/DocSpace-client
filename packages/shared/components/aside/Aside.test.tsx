import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Aside } from ".";

test("<Aside />: render without error", () => {
  render(
    <Aside visible onClose={() => {}}>
      test
    </Aside>,
  );

  expect(screen.queryByTestId("aside")).toBeInTheDocument();
});
