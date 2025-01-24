import React from "react";
import { screen, fireEvent, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import PortalLogo from "./PortalLogo";

import { renderWithTheme } from "../../utils/render-with-theme";

jest.mock("react-device-detect", () => ({
  isMobileOnly: false,
}));

describe("PortalLogo", () => {
  const mockResizeEvent = (width: number) => {
    window.innerWidth = width;
    act(() => {
      fireEvent(window, new Event("resize"));
    });
  };

  beforeEach(() => {
    // Reset window size before each test
    window.innerWidth = 1024;
  });

  it("renders without crashing", () => {
    renderWithTheme(<PortalLogo />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "/logo.ashx?logotype=2&dark=false&default=false",
    );
  });

  it("applies custom className when provided", () => {
    renderWithTheme(<PortalLogo className="custom-class" />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("custom-class");
  });

  it("adds wrapper class by default", () => {
    renderWithTheme(<PortalLogo />);
    const wrapper = screen.getByRole("img").parentElement;
    expect(wrapper?.className).toContain("wrapper");
  });

  it("shows mobile styles when screen is mobile and resizable", async () => {
    renderWithTheme(<PortalLogo isResizable />);
    mockResizeEvent(767); // Mobile breakpoint

    await waitFor(() => {
      const wrapper = screen.getByRole("img").parentElement;
      const className = wrapper?.className || "";
      expect(className).toContain("mobile");
      expect(className).toContain("resizable");
    });
  });

  it("hides logo on mobile when not resizable", async () => {
    renderWithTheme(<PortalLogo isResizable={false} />);
    mockResizeEvent(767); // Mobile breakpoint

    await waitFor(() => {
      const wrapper = screen.getByRole("img").parentElement;
      const className = wrapper?.className || "";
      expect(className).not.toContain("resizable");
    });
  });

  it("removes resize event listener on unmount", () => {
    const { unmount } = renderWithTheme(<PortalLogo isResizable />);
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("does not add resize listener when isResizable is false", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    renderWithTheme(<PortalLogo isResizable={false} />);
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });
});
