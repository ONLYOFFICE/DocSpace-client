import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { InfoBadge } from "./InfoBadge";
import type InfoBadgeProps from "./InfoBadge.types";

const baseProps: InfoBadgeProps = {
  label: "label",
  offset: 4,
  place: "bottom",
  tooltipDescription: "Description",
  tooltipTitle: "Title",
};

describe("<InfoBadge />", () => {
  it("renders without error", () => {
    render(<InfoBadge {...baseProps} />);

    expect(screen.getByTestId("info-badge"));
  });
});
