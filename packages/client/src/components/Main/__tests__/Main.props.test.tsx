// The component forwards its remaining props to <main>. Everything the store
// and Shell hand it -- mainBarVisible, isFrame, isDesktop -- is not an HTML
// attribute, and React logged a warning for each on every page until they were
// destructured out.
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("@docspace/shared/utils", () => ({ isMobile: () => false }));

const { default: Main } = await import("../index.js");

describe("Main", () => {
  it("keeps store and layout props off the DOM node", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <Main mainBarVisible isFrame={false} isDesktop data-testid="main">
        <span>content</span>
      </Main>,
    );

    const main = screen.getByTestId("main");

    for (const attribute of ["mainbarvisible", "isframe", "isdesktop"]) {
      expect(main.hasAttribute(attribute)).toBe(false);
    }
    // `data-*` still travels, so the spread itself is intact.
    expect(main).toHaveAttribute("data-testid", "main");
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });
});
