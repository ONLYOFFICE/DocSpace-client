import React from "react";
import { render, screen } from "@testing-library/react";

import Headline from "./Headline";

import "@testing-library/jest-dom";

test("<Headline />: render without error", () => {
  render(<Headline type="content">headline</Headline>);

  expect(screen.queryByText("headline")).toBeInTheDocument();
});
