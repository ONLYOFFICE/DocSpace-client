import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Heading } from "./Heading";
import { HeadingLevel, HeadingSize } from "./Heading.enums";

describe("<Heading />", () => {
  it("renders without error", () => {
    render(
      <Heading
        level={HeadingLevel.h4}
        size={HeadingSize.medium}
        title="Some title"
      >
        Some text
      </Heading>,
    );

    expect(screen.getByTestId("heading")).toBeInTheDocument();
  });
});
