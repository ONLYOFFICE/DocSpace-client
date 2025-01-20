import { Meta, StoryObj } from "@storybook/react";

import { RowsSkeleton } from "./index";

const meta = {
  title: "Skeletons/Rows",
  component: RowsSkeleton,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for rows of content",
      },
    },
  },
  argTypes: {
    count: {
      control: "number",
      defaultValue: 3,
      description: "Number of rows to render",
    },

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
} satisfies Meta<typeof RowsSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
  },
};

export const WithCircles: Story = {
  args: {
    count: 3,
  },
};

export const CustomColors: Story = {
  args: {
    count: 3,
    backgroundColor: "#e3f2fd",
    foregroundColor: "#2196f3",
  },
};
