import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import InfoPanelHeaderLoader from "./index";

const meta = {
  title: "Skeletons/InfoPanel/Header",
  component: InfoPanelHeaderLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for the info panel header",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default Header",
  render: () => <InfoPanelHeaderLoader />,
  parameters: {
    docs: {
      description: {
        story: "Default header skeleton with title and icon",
      },
    },
  },
};
