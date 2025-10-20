import React from "react";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Bonus } from "./index";

const defaultProps = {
  isEnterprise: false,
  isTrial: false,
  isDeveloper: false,
  isCommunity: false,
  salesEmail: "sales@example.com",
  dataBackupUrl: "https://example.com/backup",
  logoText: "DocSpace",
  enterpriseInstallScriptUrl: "https://example.com/script",
  enterpriseInstallWindowsUrl: "https://example.com/windows",
  forEnterprisesUrl: "https://example.com/enterprise",
  demoOrderUrl: "https://example.com/demo",
  feedbackAndSupportUrl: "https://example.com/support",
};

describe("Bonus", () => {
  it("renders without errors", () => {
    render(<Bonus {...defaultProps} />);
    expect(screen.getByTestId("bonus")).toBeInTheDocument();
  });

  it("displays community specific content", () => {
    render(<Bonus {...defaultProps} isCommunity />);
    expect(
      screen.getByTestId("community-contact-container"),
    ).toBeInTheDocument();
  });

  it("handles click on documentation links", async () => {
    const user = userEvent.setup();
    render(<Bonus {...defaultProps} />);

    const links = screen.getAllByRole("link");

    if (links.length > 0) {
      await user.click(links[0]);
      expect(links[0]).toHaveAttribute("href");
    }
  });
});
