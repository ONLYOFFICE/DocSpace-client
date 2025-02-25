import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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
