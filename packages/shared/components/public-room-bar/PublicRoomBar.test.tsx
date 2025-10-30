import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import PublicRoomBar from "./index";

describe("PublicRoomBar", () => {
  const defaultProps = {
    headerText: "Test Header",
    bodyText: "Test Body",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<PublicRoomBar {...defaultProps} />);

    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom icon", () => {
    const customIcon = "custom-icon-path.svg";
    render(<PublicRoomBar {...defaultProps} iconName={customIcon} />);

    const iconElement = screen.getByTestId("icon-button");
    expect(iconElement).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<PublicRoomBar {...defaultProps} />);

    const closeButton = screen.getByTestId("icon-button");
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render close button when onClose is not provided", () => {
    // biome-ignore lint/correctness/noUnusedVariables: TODO fix
    const { onClose, ...propsWithoutClose } = defaultProps;
    render(<PublicRoomBar {...propsWithoutClose} />);

    const closeButton = screen.queryByRole("button");
    expect(closeButton).not.toBeInTheDocument();
  });

  it("applies barVisible class when barIsVisible prop is true", () => {
    render(<PublicRoomBar {...defaultProps} barIsVisible />);

    const container = screen
      .getByText("Test Header")
      .closest("div[class*='container']");
    expect(container).toHaveClass("barVisible");
  });

  it("renders header as div when headerText is not a string", () => {
    const customHeader = <span>Custom Header</span>;
    render(<PublicRoomBar {...defaultProps} headerText={customHeader} />);

    const headerContainer = screen.getByText("Custom Header").closest("div");
    expect(headerContainer).toBeInTheDocument();
  });

  it("renders body as div when bodyText is not a string", () => {
    const customBody = <span>Custom Body</span>;
    render(<PublicRoomBar {...defaultProps} bodyText={customBody} />);

    const bodyContainer = screen.getByText("Custom Body").closest("div");
    expect(bodyContainer).toBeInTheDocument();
  });
});
