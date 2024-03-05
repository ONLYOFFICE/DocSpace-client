import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { translates, config } from "./campaign/CreateDocSpace";

import { CampaignsBanner } from "./CampaignsBanner";

describe("<CampaignsBanner />", () => {
  it("renders without error", () => {
    render(
      <CampaignsBanner
        campaignImage="" // TODO: add url on image
        campaignTranslate={translates}
        campaignConfig={config}
        onClose={() => null}
        onAction={() => null}
      />,
    );

    expect(screen.getByTestId("campaigns-banner")).toBeInTheDocument();
  });
});
