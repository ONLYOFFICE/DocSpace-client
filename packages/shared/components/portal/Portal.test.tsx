import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Portal } from "./index";

describe("Portal Component", () => {
  const testId = "portal-test";

  beforeEach(() => {
    // Clean up any leftover portals
    document.body.innerHTML = "";
  });

  it("renders nothing when visible is false", () => {
    const { container } = render(
      <Portal
        visible={false}
        element={<div data-testid={testId}>Test Content</div>}
      />,
    );

    // Check both the container and document.body since Portal renders outside the container
    expect(container.firstChild).toBeNull();
    expect(document.body.querySelector(`[data-testid="${testId}"]`)).toBe(null);
  });

  it("renders content in document.body by default", () => {
    render(
      <Portal visible element={<div data-testid={testId}>Test Content</div>} />,
    );

    const portalContent = screen.getByTestId(testId);
    expect(portalContent).toBeInTheDocument();
    expect(document.body.contains(portalContent)).toBe(true);
  });

  it("renders content in specified appendTo element", () => {
    const customContainer = document.createElement("div");
    customContainer.id = "custom-container";
    document.body.appendChild(customContainer);

    render(
      <Portal
        visible
        element={<div data-testid={testId}>Test Content</div>}
        appendTo={customContainer}
      />,
    );

    const portalContent = screen.getByTestId(testId);
    expect(portalContent).toBeInTheDocument();
    expect(customContainer.contains(portalContent)).toBe(true);
  });

  it("mounts content when visible changes from false to true", () => {
    const { rerender } = render(
      <Portal
        visible={false}
        element={<div data-testid={testId}>Test Content</div>}
      />,
    );

    expect(document.body.querySelector(`[data-testid="${testId}"]`)).toBe(null);

    rerender(
      <Portal visible element={<div data-testid={testId}>Test Content</div>} />,
    );

    expect(
      document.body.querySelector(`[data-testid="${testId}"]`),
    ).toBeInTheDocument();
  });
});
