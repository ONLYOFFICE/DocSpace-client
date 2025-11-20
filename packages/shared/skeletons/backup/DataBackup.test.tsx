import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import DataBackupLoader from "./DataBackup";

describe("DataBackupLoader", () => {
  const defaultProps = {
    title: "Data Backup",
    borderRadius: "3px",
    backgroundColor: "#eee",
    foregroundColor: "#ddd",
    backgroundOpacity: 0.2,
    foregroundOpacity: 0.4,
    speed: 1,
    animate: true,
  };

  it("renders without crashing", () => {
    render(<DataBackupLoader {...defaultProps} />);
    expect(screen.getByTestId("data-backup-loader")).toBeInTheDocument();
  });
});
