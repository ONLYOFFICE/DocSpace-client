import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import RestoreBackupLoader from "./RestoreBackup";

describe("RestoreBackupLoader", () => {
  const defaultProps = {
    title: "Test Title",
    borderRadius: "3px",
    backgroundColor: "#000",
    foregroundColor: "#fff",
    backgroundOpacity: 0.2,
    foregroundOpacity: 0.4,
    speed: 1,
    animate: true,
  };

  it("renders without crashing", () => {
    render(<RestoreBackupLoader {...defaultProps} />);
    expect(screen.getByTestId("restore-backup-loader")).toBeInTheDocument();
  });
});
