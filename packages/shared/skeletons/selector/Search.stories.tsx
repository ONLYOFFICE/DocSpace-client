import { Meta, StoryObj } from "@storybook/react";

import SearchLoader from "./Search";

const meta = {
  title: "Skeletons/Selector/Search",
  component: SearchLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for search input",
      },
    },
  },
  argTypes: {
    style: {
      control: "object",
      description: "Custom styles for the container",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchLoader>;

export default meta;

type Story = StoryObj<typeof SearchLoader>;

export const Default: Story = {
  args: {
    style: { margin: "20px" },
  },
};
