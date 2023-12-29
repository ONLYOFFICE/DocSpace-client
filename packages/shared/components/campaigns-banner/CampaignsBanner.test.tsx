import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import CampaignsCloudPng from "PUBLIC_DIR/images/campaigns.cloud.png";

import { CampaignsBanner } from "./CampaignsBanner";

describe("<CampaignsBanner />", () => {
  it("renders without error", () => {
    render(
      <CampaignsBanner
        headerLabel="ONLYOFFICE for business"
        subHeaderLabel="Docs, projects, clients & emails"
        buttonLabel="START FREE TRIAL"
        img={CampaignsCloudPng}
        link="https://onlyoffice.com"
      />,
    );

    expect(screen.getByTestId("campaigns-banner")).toBeInTheDocument();
  });
});
