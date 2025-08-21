import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import "@testing-library/jest-dom";

import EmptyFilterRoomsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import { EmptyView } from ".";
import { EmptyViewProps } from "./EmptyView.types";

const mockProps: EmptyViewProps = {
  icon: <EmptyFilterRoomsLightIcon />,
  title: "Test Title",
  description: "Test Description",
  options: null,
};

const mockOptionsProps = {
  ...mockProps,
  options: [
    {
      key: "test-action",
      icon: <ClearEmptyFilterSvg />,
      to: "/test",
      description: "Test Action",
      onClick: jest.fn(),
    },
  ],
};

describe("EmptyView", () => {
  const renderComponent = (props: EmptyViewProps) =>
    render(
      <BrowserRouter>
        <EmptyView {...props} />
      </BrowserRouter>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without options", () => {
    renderComponent({ ...mockProps, options: null });

    expect(screen.getByTestId("empty-view")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Test Title",
    );
  });

  it("renders with options", () => {
    renderComponent(mockOptionsProps);

    expect(screen.getByTestId("empty-view")).toBeInTheDocument();
    expect(screen.getByText("Test Action")).toBeInTheDocument();
  });

  it("calls onClick when option is clicked", () => {
    renderComponent(mockOptionsProps);

    const option = screen.getByText("Test Action");
    fireEvent.click(option);

    expect(mockOptionsProps.options[0].onClick).toHaveBeenCalledTimes(1);
  });

  it("renders with correct styles", () => {
    renderComponent(mockProps);

    const wrapper = screen.getByTestId("empty-view");
    const title = screen.getByText("Test Title");
    const description = screen.getByText("Test Description");

    expect(wrapper).toHaveClass("wrapper");
    expect(title).toHaveClass("headerTitle");
    expect(description).toHaveClass("subheading");
  });

  it("renders icon when provided", () => {
    renderComponent(mockProps);

    const icon = screen.getByText("", { selector: "test-file-stub" });
    expect(icon).toBeInTheDocument();
  });

  it("renders options in body section when provided", () => {
    renderComponent(mockOptionsProps);

    const wrapper = screen.getByTestId("empty-view");
    const body = wrapper?.querySelector(".body");
    expect(body).toBeInTheDocument();
    expect(body).toHaveClass("body");
    expect(body?.children.length).toBe(1);
  });

  it("does not render body section when no options provided", () => {
    renderComponent(mockProps);

    const wrapper = screen.getByTestId("empty-view");
    const body = wrapper?.querySelector(".body");
    expect(body).not.toBeInTheDocument();
  });
});
