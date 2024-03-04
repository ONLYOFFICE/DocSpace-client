import { Meta, StoryObj } from "@storybook/react";

import { CampaignsBanner } from "./CampaignsBanner";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

import { translates, config } from "./campaign/CreateDocSpace";

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

const Template = (args: CampaignsBannerProps) => (
  <div style={{ width: "208px" }}>
    <CampaignsBanner {...args} />
  </div>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    campaignImage: "", // TODO: add url on image
    campaignTranslate: translates,
    campaignConfig: config,
  },
};
