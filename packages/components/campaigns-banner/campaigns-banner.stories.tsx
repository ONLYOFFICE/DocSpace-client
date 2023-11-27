import React from "react";
import CampaignsBanner from "./";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/campaigns.cl... Remove this comment to see the full error message
import CampaignsCloudPng from "PUBLIC_DIR/images/campaigns.cloud.png";

export default {
  title: "Components/CampaignsBanner",
  component: CampaignsBanner,
  parameters: {
    docs: {
      description: {
        component: "Used to display an campaigns banner.",
      },
    },
  },
};

const Template = (args: any) => <CampaignsBanner {...args} />;

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  headerLabel: "ONLYOFFICE for business",
  subHeaderLabel: "Docs, projects, clients & emails",
  img: CampaignsCloudPng,
  buttonLabel: "START FREE TRIAL",
  link: "https://www.onlyoffice.com/ru/registration.aspx?utm_source=personal&utm_campaign=BannerPersonalCloud",
};
