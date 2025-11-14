import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  SettingsCommonSkeleton,
  SettingsDSConnectSkeleton,
  SettingsHeaderSkeleton,
  SettingsSMTPSkeleton,
  SettingsStorageManagementSkeleton,
} from "./index";
import styles from "./Settings.module.scss";

describe("SettingsHeaderSkeleton", () => {
  it("renders header skeleton", () => {
    render(<SettingsHeaderSkeleton />);
    const rectangles = screen.getAllByRole("img");
    expect(rectangles.length).toBeGreaterThan(0);
  });
});

describe("SettingsCommonSkeleton", () => {
  it("renders common settings skeleton", () => {
    render(<SettingsCommonSkeleton />);
    const rectangles = screen.getAllByRole("img");
    expect(rectangles.length).toBeGreaterThan(0);
  });
});

describe("SettingsSMTPSkeleton", () => {
  it("renders SMTP settings skeleton", () => {
    render(<SettingsSMTPSkeleton />);

    const container = screen.getByTestId("settings-smtp-skeleton");
    expect(container).toHaveClass(styles.smtpContent);

    const rectangles = screen.getAllByRole("img");
    expect(rectangles.length).toBeGreaterThan(0);
  });
});

describe("SettingsStorageManagementSkeleton", () => {
  const defaultProps = {
    id: "test-storage",
    className: "test-class",
    style: { margin: "10px" },
  };

  it("renders storage management skeleton", () => {
    render(<SettingsStorageManagementSkeleton {...defaultProps} />);

    const rectangles = screen.getAllByRole("img");
    expect(rectangles.length).toBeGreaterThan(0);
  });
});

describe("SettingsDSConnectSkeleton", () => {
  it("renders DS connect skeleton", () => {
    render(<SettingsDSConnectSkeleton />);
    const rectangles = screen.getAllByRole("img");
    expect(rectangles.length).toBeGreaterThan(0);
  });
});
