import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DragAndDrop from "./DragAndDrop";

describe("DragAndDrop", () => {
  const mockOnDrop = vi.fn();
  const defaultProps = {
    onDrop: mockOnDrop,
    children: <div>Drop files here</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(<DragAndDrop {...defaultProps} />);
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
  });
});
