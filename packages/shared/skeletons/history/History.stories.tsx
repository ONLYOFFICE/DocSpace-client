import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import History from "./index";

const meta = {
  title: "Skeletons/History",
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton components for history rows",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleRow: Story = {
  name: "Single History Row",
  render: () => <History />,
  parameters: {
    docs: {
      description: {
        story:
          "Single history row skeleton showing file link, date, and actions",
      },
    },
  },
};
