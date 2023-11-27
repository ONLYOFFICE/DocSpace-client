import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import CampaignsBanner from ".";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/campaigns.cl... Remove this comment to see the full error message
import CampaignsCloudPng from "PUBLIC_DIR/images/campaigns.cloud.png";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<CampaignsBanner />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      <CampaignsBanner
        headerLabel="ONLYOFFICE for business"
        // @ts-expect-error TS(2322): Type '{ headerLabel: string; textLabel: string; bu... Remove this comment to see the full error message
        textLabel="Docs, projects, clients & emails"
        buttonLabel="START FREE TRIAL"
        img={CampaignsCloudPng}
        btnLink="https://onlyoffice.com"
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });
});
