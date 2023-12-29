import { Meta, StoryObj } from "@storybook/react";

import { InfoBadge } from "./InfoBadge";

type InfoBadgeType = typeof InfoBadge;
type Story = StoryObj<InfoBadgeType>;

const meta: Meta<InfoBadgeType> = {
  title: "Components/InfoBadge",
  component: InfoBadge,
};

export default meta;

export const Default: Story = {
  args: {
    offset: 10,
    label: "Label",
    place: "bottom",
    tooltipTitle: "Title",
    tooltipDescription: "Description",
  },
};
