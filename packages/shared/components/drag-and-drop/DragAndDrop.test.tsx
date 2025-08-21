import React from "react";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import DragAndDrop from "./DragAndDrop";

describe("DragAndDrop", () => {
  const mockOnDrop = jest.fn();
  const defaultProps = {
    onDrop: mockOnDrop,
    children: <div>Drop files here</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(<DragAndDrop {...defaultProps} />);
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
  });
});
