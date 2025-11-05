import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";

import { MobileCategoryWrapper } from "./index";

vi.mock("../../utils/common", () => ({
  isManagement: vi.fn(() => false),
}));

vi.mock("../../hooks/useTheme", () => ({
  useTheme: vi.fn(() => ({ isBase: true })),
}));

const defaultProps = {
  title: "Test Title",
  url: "/test-url",
  subtitle: "Test Subtitle",
  onClickLink: vi.fn((e) => e.preventDefault()),
  isDisabled: false,
  withPaidBadge: false,
  badgeLabel: "PRO",
};

describe("MobileCategoryWrapper", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<MobileCategoryWrapper {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.badgeLabel)).not.toBeInTheDocument();
  });

  it("renders with paid badge when withPaidBadge is true", () => {
    render(<MobileCategoryWrapper {...defaultProps} withPaidBadge />);

    expect(screen.getByText(defaultProps.badgeLabel)).toBeInTheDocument();
  });

  it("handles click events when not disabled", () => {
    render(<MobileCategoryWrapper {...defaultProps} />);

    const link = screen.getByText(defaultProps.title);
    fireEvent.click(link);

    expect(defaultProps.onClickLink).toHaveBeenCalled();
  });

  it("does not handle click events when disabled", () => {
    render(<MobileCategoryWrapper {...defaultProps} isDisabled />);

    const link = screen.getByText(defaultProps.title);
    fireEvent.click(link);

    expect(defaultProps.onClickLink).not.toHaveBeenCalled();
  });
});
