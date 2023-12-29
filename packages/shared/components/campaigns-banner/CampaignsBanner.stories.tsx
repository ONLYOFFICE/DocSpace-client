import { Meta, StoryObj } from "@storybook/react";
import CampaignsCloudPng from "PUBLIC_DIR/images/campaigns.cloud.png";

import { CampaignsBanner } from "./CampaignsBanner";

const meta = {
  title: "Components/CampaignsBanner",
  component: CampaignsBanner,
  parameters: {
    docs: {
      description: {
        component: "Used to display an campaigns banner.",
      },
    },
  },
} satisfies Meta<typeof CampaignsBanner>;
type Story = StoryObj<typeof CampaignsBanner>;

export default meta;

export const Default: Story = {
  args: {
    headerLabel: "ONLYOFFICE for business",
    subHeaderLabel: "Docs, projects, clients & emails",
    img: CampaignsCloudPng,
    buttonLabel: "START FREE TRIAL",
    link: "https://www.onlyoffice.com/ru/registration.aspx?utm_source=personal&utm_campaign=BannerPersonalCloud",
  },
};
