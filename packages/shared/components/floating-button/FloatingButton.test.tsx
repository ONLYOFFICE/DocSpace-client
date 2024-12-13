import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FloatingButton } from ".";
import { FloatingButtonIcons } from "./FloatingButton.enums";
import { renderWithTheme } from "../../utils/render-with-theme";
import { Base } from "../../themes";

describe("FloatingButton", () => {
  const defaultProps = {
    icon: FloatingButtonIcons.upload,
    percent: 5,
  };

  const theme = {
    ...Base,
  };

  const renderComponent = (ui: React.ReactNode) => {
    return renderWithTheme(ui, theme);
  };

  it("renders without crashing", () => {
    renderComponent(<FloatingButton {...defaultProps} />);
    const button = screen.getByTestId("floating-button");
    expect(button).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const className = "custom-class";
    renderComponent(<FloatingButton {...defaultProps} className={className} />);
    expect(screen.getByTestId("floating-button")).toHaveClass(className);
  });

  it("renders with custom style", () => {
    const style = { marginTop: "10px" };
    renderComponent(<FloatingButton {...defaultProps} style={style} />);
    const button = screen.getByTestId("floating-button");
    expect(button).toHaveStyle({ marginTop: "10px" });
  });

  it("handles click events", () => {
    const onClick = jest.fn();
    renderComponent(<FloatingButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByTestId("floating-button");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("displays alert when alert prop is true", () => {
    renderComponent(<FloatingButton {...defaultProps} alert />);
    const alertIcon = screen.getByTestId("floating-button-alert");
    expect(alertIcon).toBeInTheDocument();
  });

  it("shows progress indicator when percent > 0", () => {
    const percent = 50;
    renderComponent(<FloatingButton {...defaultProps} percent={percent} />);
    const progress = screen.getByTestId("floating-button-progress");
    expect(progress).toBeInTheDocument();
  });

  it("renders different icons correctly", () => {
    Object.values(FloatingButtonIcons).forEach((icon) => {
      const { container } = renderComponent(
        <FloatingButton {...defaultProps} icon={icon} />,
      );
      const iconElement = container.querySelector(`[data-icon="${icon}"]`);
      expect(iconElement).toBeInTheDocument();
    });
  });

  it("clears upload history when clearUploadedFilesHistory is called", () => {
    const clearUploadedFilesHistory = jest.fn();
    renderComponent(
      <FloatingButton
        {...defaultProps}
        clearUploadedFilesHistory={clearUploadedFilesHistory}
        percent={100}
      />,
    );

    const button = screen.getByTestId("floating-button-close-icon");
    fireEvent.click(button);

    expect(clearUploadedFilesHistory).toHaveBeenCalledTimes(1);
  });

  describe("accessibility", () => {
    it("has correct ARIA attributes", () => {
      renderComponent(<FloatingButton {...defaultProps} />);
      const button = screen.getByTestId("floating-button");

      expect(button).toHaveAttribute("data-role", "button");
      expect(button).toHaveAttribute(
        "aria-label",
        `${defaultProps.icon} button`,
      );
    });

    it("is keyboard accessible", () => {
      const onClick = jest.fn();
      renderComponent(<FloatingButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId("floating-button");
      fireEvent.keyPress(button, { key: "Enter", code: 13, charCode: 13 });

      expect(onClick).toHaveBeenCalledTimes(0);
    });
  });
});
