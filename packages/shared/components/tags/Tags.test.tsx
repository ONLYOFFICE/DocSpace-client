import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Tags } from "./Tags";
import type { TagsProps } from "./Tags.types";

const baseProps: TagsProps = {
  tags: ["tag1", "tag2"],
  columnCount: 2,
  onSelectTag: () => {},
};

describe("<Tags />", () => {
  it("renders without error", () => {
    render(<Tags {...baseProps} />);

    expect(screen.getByTestId("tags"));
  });
});
