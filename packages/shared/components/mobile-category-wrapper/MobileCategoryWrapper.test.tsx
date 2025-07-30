import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../utils/render-with-theme";
import { MobileCategoryWrapper } from "./index";

jest.mock("../../utils/common", () => ({
  isManagement: jest.fn(() => false),
}));

jest.mock("../../hooks/useTheme", () => ({
  useTheme: jest.fn(() => ({ isBase: true })),
}));

const defaultProps = {
  title: "Test Title",
  url: "/test-url",
  subtitle: "Test Subtitle",
  onClickLink: jest.fn(),
  isDisabled: false,
  withPaidBadge: false,
  badgeLabel: "PRO",
};

describe("MobileCategoryWrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    renderWithTheme(<MobileCategoryWrapper {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.badgeLabel)).not.toBeInTheDocument();
  });

  it("renders with paid badge when withPaidBadge is true", () => {
    renderWithTheme(<MobileCategoryWrapper {...defaultProps} withPaidBadge />);

    expect(screen.getByText(defaultProps.badgeLabel)).toBeInTheDocument();
  });

  it("handles click events when not disabled", () => {
    renderWithTheme(<MobileCategoryWrapper {...defaultProps} />);

    const link = screen.getByText(defaultProps.title);
    fireEvent.click(link);

    expect(defaultProps.onClickLink).toHaveBeenCalled();
  });

  it("does not handle click events when disabled", () => {
    renderWithTheme(<MobileCategoryWrapper {...defaultProps} isDisabled />);

    const link = screen.getByText(defaultProps.title);
    fireEvent.click(link);

    expect(defaultProps.onClickLink).not.toHaveBeenCalled();
  });
});
