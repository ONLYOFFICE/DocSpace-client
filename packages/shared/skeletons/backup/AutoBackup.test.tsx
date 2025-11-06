import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import AutoBackupLoader from "./AutoBackup";

describe("AutoBackupLoader", () => {
  const defaultProps = {
    title: "Auto Backup",
    borderRadius: "3px",
    backgroundColor: "#eee",
    foregroundColor: "#ddd",
    backgroundOpacity: 0.2,
    foregroundOpacity: 0.4,
    speed: 1,
    animate: true,
  };

  it("renders without crashing", () => {
    render(<AutoBackupLoader {...defaultProps} />);
    expect(screen.getByTestId("auto-backup-loader")).toBeInTheDocument();
  });
});
