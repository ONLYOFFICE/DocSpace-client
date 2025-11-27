import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { Base, Dark, TInterfaceDirection } from "../../themes";

import { ThemeProvider } from ".";

const mockColorScheme = {
  id: 1,
  name: "Mock Theme",
  main: {
    accent: "#333333",
    buttons: "#0F4071",
  },
  text: {
    accent: "#333333",
    buttons: "#FFFFFF",
  },
};

describe("ThemeProvider", () => {
  const TestChild = () => <div data-testid="test-child">Test Child</div>;

  beforeEach(() => {
    // Reset root element attributes and styles before each test
    document.documentElement.removeAttribute("data-theme");
    const styles = document.documentElement.style;
    styles.removeProperty("--color-scheme-main-accent");
    styles.removeProperty("--color-scheme-text-accent");
    styles.removeProperty("--color-scheme-main-buttons");
    styles.removeProperty("--color-scheme-text-buttons");
    styles.removeProperty("--interface-direction");
  });

  it("renders children correctly", () => {
    render(
      <ThemeProvider theme={Base}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("sets light theme correctly", () => {
    render(
      <ThemeProvider theme={Base}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("sets dark theme correctly", () => {
    render(
      <ThemeProvider theme={Dark}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("sets interface direction correctly", () => {
    const rtlTheme = {
      ...Base,
      interfaceDirection: "rtl" as TInterfaceDirection,
    };
    render(
      <ThemeProvider theme={rtlTheme}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue("--interface-direction"),
    ).toBe("rtl");
  });

  it("sets color scheme correctly", () => {
    render(
      <ThemeProvider theme={Base} currentColorScheme={mockColorScheme}>
        <TestChild />
      </ThemeProvider>,
    );

    const rootStyles = document.documentElement.style;
    expect(rootStyles.getPropertyValue("--color-scheme-main-accent")).toBe(
      mockColorScheme.main.accent,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-text-accent")).toBe(
      mockColorScheme.text.accent,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-main-buttons")).toBe(
      mockColorScheme.main.buttons,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-text-buttons")).toBe(
      mockColorScheme.text.buttons,
    );
  });

  it("updates theme when props change", () => {
    const { rerender } = render(
      <ThemeProvider theme={Base}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    rerender(
      <ThemeProvider theme={Dark}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("updates color scheme when props change", () => {
    const { rerender } = render(
      <ThemeProvider theme={Base} currentColorScheme={mockColorScheme}>
        <TestChild />
      </ThemeProvider>,
    );

    const newColorScheme = {
      id: 2,
      name: "New Theme",
      main: {
        accent: "#444444",
        buttons: "#1F5081",
      },
      text: {
        accent: "#444444",
        buttons: "#EEEEEE",
      },
    };

    rerender(
      <ThemeProvider theme={Base} currentColorScheme={newColorScheme}>
        <TestChild />
      </ThemeProvider>,
    );

    const rootStyles = document.documentElement.style;
    expect(rootStyles.getPropertyValue("--color-scheme-main-accent")).toBe(
      newColorScheme.main.accent,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-text-accent")).toBe(
      newColorScheme.text.accent,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-main-buttons")).toBe(
      newColorScheme.main.buttons,
    );
    expect(rootStyles.getPropertyValue("--color-scheme-text-buttons")).toBe(
      newColorScheme.text.buttons,
    );
  });

  it("handles theme change with color scheme", () => {
    const { rerender } = render(
      <ThemeProvider theme={Base} currentColorScheme={mockColorScheme}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    rerender(
      <ThemeProvider theme={Dark} currentColorScheme={mockColorScheme}>
        <TestChild />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    const rootStyles = document.documentElement.style;
    expect(rootStyles.getPropertyValue("--color-scheme-main-accent")).toBe(
      mockColorScheme.main.accent,
    );
  });

  it("applies SCSS styles correctly", () => {
    render(
      <ThemeProvider theme={Base}>
        <div className="accent-main" data-testid="accent-main">
          Accent Main
        </div>
        <div className="accent-text" data-testid="accent-text">
          Accent Text
        </div>
        <div className="accent-button" data-testid="accent-button">
          Accent Button
        </div>
      </ThemeProvider>,
    );

    const accentMain = screen.getByTestId("accent-main");
    const accentText = screen.getByTestId("accent-text");
    const accentButton = screen.getByTestId("accent-button");

    expect(window.getComputedStyle(accentMain).color).toBeDefined();
    expect(window.getComputedStyle(accentText).color).toBeDefined();
    expect(window.getComputedStyle(accentButton).backgroundColor).toBeDefined();
  });
});
