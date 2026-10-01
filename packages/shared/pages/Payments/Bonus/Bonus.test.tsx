import React from "react";
import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";

import { Bonus } from "./index";

const defaultProps = {
  salesEmail: "sales@example.com",
  logoText: "DocSpace",
  enterpriseInstallScriptUrl: "https://example.com/script",
  enterpriseInstallWindowsUrl: "https://example.com/windows",
  forEnterprisesUrl: "https://example.com/enterprise",
  demoOrderUrl: "https://example.com/demo",
  feedbackAndSupportUrl: "https://helpdesk.example.com/support",
};

describe("Bonus", () => {
  it("renders every block of the upgrade page", () => {
    render(<Bonus {...defaultProps} />);

    expect(screen.getByTestId("bonus")).toBeInTheDocument();
    expect(screen.getByTestId("bonus-features")).toBeInTheDocument();
    expect(
      screen.getByTestId("bonus-official-documentation"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("bonus-upgrade-note")).toBeInTheDocument();
    expect(screen.getByTestId("bonus-help")).toBeInTheDocument();
  });

  it("lists the four enterprise features", () => {
    render(<Bonus {...defaultProps} />);

    expect(screen.getByText("Common:UpgradeAIToolsTitle")).toBeInTheDocument();
    expect(
      screen.getByText("Common:UpgradeMobileEditingTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Common:UpgradeScalabilityTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Common:UpgradeTechSupportTitle"),
    ).toBeInTheDocument();
  });

  it("hides help lines that have no address", () => {
    render(
      <Bonus
        {...defaultProps}
        salesEmail=""
        forEnterprisesUrl=""
        demoOrderUrl=""
        feedbackAndSupportUrl=""
      />,
    );

    expect(
      screen.queryByTestId("for_enterprise_license_link"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("demo_order_link")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("upgrade_to_pro_banner_purchase_link"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("upgrade_to_pro_banner_support_link"),
    ).not.toBeInTheDocument();
  });

  it("points each deployment instruction at its documentation", () => {
    render(<Bonus {...defaultProps} />);

    expect(
      screen.getByTestId("enterprise_install_script_docker_link"),
    ).toHaveAttribute("href", defaultProps.enterpriseInstallScriptUrl);
    expect(
      screen.getByTestId("enterprise_install_script_linux_link"),
    ).toHaveAttribute("href", defaultProps.enterpriseInstallScriptUrl);
    expect(
      screen.getByTestId("enterprise_install_script_windows_link"),
    ).toHaveAttribute("href", defaultProps.enterpriseInstallWindowsUrl);
  });
});
