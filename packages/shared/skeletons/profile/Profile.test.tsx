import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ProfileViewLoader } from "./Profile.view";
import { ProfileFooterLoader } from "./Profile.footer";
import styles from "./Profile.module.scss";

jest.mock("../../utils", () => ({
  isDesktop: () => true,
  isMobile: () => false,
}));

describe("ProfileViewLoader", () => {
  it("renders desktop view correctly", () => {
    render(<ProfileViewLoader />);

    const view = screen.getByTestId("profile-view");
    const wrapper = view.querySelector(`.${styles.wrapper}`);

    expect(view).toBeInTheDocument();
    expect(wrapper).toBeInTheDocument();
  });
});

describe("ProfileFooterLoader", () => {
  it("renders footer correctly", () => {
    render(<ProfileFooterLoader />);

    const footerBlock = screen.getByTestId("profile-footer");
    expect(footerBlock).toHaveClass(styles.footerBlock);
  });
});
