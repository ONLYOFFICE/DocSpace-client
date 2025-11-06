import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import NotificationsLoader from "./index";
import styles from "./Notifications.module.scss";

describe("NotificationsLoader", () => {
  it("renders with default count", () => {
    render(<NotificationsLoader />);
    const items = screen.getAllByTestId("notification-loader");
    expect(items).toHaveLength(1); // Default count is 1
  });

  it("renders with custom count", () => {
    render(<NotificationsLoader count={3} />);
    const items = screen.getAllByTestId("notification-loader");
    expect(items).toHaveLength(3);
  });

  it("applies notification class", () => {
    render(<NotificationsLoader />);
    const notification = screen.getByTestId("notification-loader");
    expect(notification).toHaveClass(styles.notification);
  });
});
