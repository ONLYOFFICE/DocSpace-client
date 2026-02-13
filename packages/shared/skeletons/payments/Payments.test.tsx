import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import PaymentsLoader from "./index";
import styles from "./Payments.module.scss";

describe("PaymentsLoader", () => {
  it("renders main loader with correct structure", () => {
    render(<PaymentsLoader />);

    const loader = screen.getByTestId("payments-loader");
    expect(loader).toHaveClass(styles.paymentsLoader);
  });
});
