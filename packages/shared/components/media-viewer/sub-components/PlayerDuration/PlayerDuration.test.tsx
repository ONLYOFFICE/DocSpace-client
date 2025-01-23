import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlayerDuration } from "./index";

// Mock styles
jest.mock("./PlayerDuration.module.scss", () => ({
  wrapper: "wrapper",
}));

describe("PlayerDuration", () => {
  const defaultProps = {
    currentTime: 65, // 1:05
    duration: 180, // 3:00
  };

  it("renders correctly with default props", () => {
    render(<PlayerDuration {...defaultProps} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:05");
    expect(totalDuration).toHaveTextContent("3:00");
  });

  it("renders zero values correctly", () => {
    render(<PlayerDuration currentTime={0} duration={0} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("0:00");
    expect(totalDuration).toHaveTextContent("0:00");
  });

  it("renders long duration correctly", () => {
    render(
      <PlayerDuration
        currentTime={3665} // 1:01:05
        duration={7325} // 2:02:05
      />,
    );

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:01:05");
    expect(totalDuration).toHaveTextContent("2:02:05");
  });
});
