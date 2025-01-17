import { Meta, StoryObj } from "@storybook/react";

import { ProfileViewLoader } from "./Profile.view";

const meta = {
  title: "Skeletons/Profile",
  component: ProfileViewLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for profile view",
      },
    },
  },
  argTypes: {
    borderRadius: {
      control: "text",
      defaultValue: "3px",
      description: "Border radius for the skeleton rectangles",
    },
    backgroundColor: {
      control: "color",
      description: "Background color for the skeleton",
    },
    foregroundColor: {
      control: "color",
      description: "Foreground color for the skeleton animation",
    },
    backgroundOpacity: {
      control: "number",
      defaultValue: 0.2,
      description: "Opacity of the background",
    },
    foregroundOpacity: {
      control: "number",
      defaultValue: 1,
      description: "Opacity of the foreground",
    },
    speed: {
      control: "number",
      defaultValue: 2,
      description: "Animation speed in seconds",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileViewLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomColors: Story = {
  args: {
    backgroundColor: "#e3f2fd",
    foregroundColor: "#2196f3",
  },
};
