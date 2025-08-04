import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { StandalonePage } from "./index";

describe("StandalonePage", () => {
  const defaultProps = {
    isTrial: false,
    setPaymentsLicense: jest.fn(),
    acceptPaymentsLicense: jest.fn(),
    isLicenseCorrect: true,
    salesEmail: "sales@example.com",
    isLicenseDateExpired: false,
    isDeveloper: false,
    buyUrl: "https://example.com/buy",
    trialDaysLeft: 30,
    paymentDate: "2025-06-11",
    isEnterprise: true,
    logoText: "DocSpace",
    openOnNewPage: false,
    licenseQuota: {
      userQuota: {},
      license: {
        branding: false,
        customization: false,
        timeLimited: false,
        end_date: "2025-06-11",
        trial: false,
        customer_id: "1",
        resource_key: "1",
        users_count: 10,
        users_expire: 30,
        connections: 10,
        docspace_dev: false,
      },
      totalUsers: 20,
      portalUsers: 1,
      externalUsers: 0,
    },
    docspaceFaqUrl: "https://example.com/faq",
  };

  it("renders without errors", () => {
    render(<StandalonePage {...defaultProps} />);
    expect(screen.getByTestId("standalone-page")).toBeInTheDocument();
  });

  it("renders EnterpriseContainer when isTrial is false", () => {
    render(<StandalonePage {...defaultProps} />);
    expect(
      screen.getByText("ActivateRenewSubscriptionHeader"),
    ).toBeInTheDocument();
  });

  it("renders TrialContainer when isTrial is true", () => {
    render(<StandalonePage {...defaultProps} isTrial />);
    expect(screen.getByText("ActivateSwithToProHeader")).toBeInTheDocument();
  });

  it("renders LicenseContainer with correct props", () => {
    render(<StandalonePage {...defaultProps} />);
    expect(screen.getByText("ActivateLicense")).toBeInTheDocument();
    expect(screen.getByText("ActivateRenewalDescr")).toBeInTheDocument();
  });

  it("renders ContactContainer with salesEmail", () => {
    render(<StandalonePage {...defaultProps} />);
    expect(screen.getByText("ContactUs")).toBeInTheDocument();
    expect(screen.getByText(defaultProps.salesEmail)).toBeInTheDocument();
  });

  it("passes correct props to TrialContainer when in trial mode", () => {
    const trialProps = {
      ...defaultProps,
      isTrial: true,
      trialDaysLeft: 15,
    };

    render(<StandalonePage {...trialProps} />);
    expect(screen.getByText("ActivateSwithToProHeader")).toBeInTheDocument();
    expect(screen.getByText("ActivatePurchaseBuyLicense")).toBeInTheDocument();
  });

  it("passes correct props to EnterpriseContainer when not in trial mode", () => {
    const enterpriseProps = {
      ...defaultProps,
      isLicenseDateExpired: true,
    };

    render(<StandalonePage {...enterpriseProps} />);
    expect(
      screen.getByText("ActivateRenewSubscriptionHeader"),
    ).toBeInTheDocument();
    expect(screen.getByText("ActivatePurchaseBuyLicense")).toBeInTheDocument();
  });

  it("handles license file upload", async () => {
    const user = userEvent.setup();
    const setPaymentsLicense = jest.fn();

    render(
      <StandalonePage
        {...defaultProps}
        setPaymentsLicense={setPaymentsLicense}
      />,
    );

    const fileInput = screen.getByTestId("upload-click-input");
    const file = new File(["license content"], "license.lic", {
      type: "application/octet-stream",
    });

    await user.upload(fileInput, file);

    expect(setPaymentsLicense).toHaveBeenCalled();
  });

  it("handles license activation button click", async () => {
    const user = userEvent.setup();
    const acceptPaymentsLicense = jest.fn();

    render(
      <StandalonePage
        {...defaultProps}
        acceptPaymentsLicense={acceptPaymentsLicense}
      />,
    );

    const activateButton = screen.getByText("Common:Activate");
    await user.click(activateButton);

    expect(acceptPaymentsLicense).toHaveBeenCalled();
  });
});
