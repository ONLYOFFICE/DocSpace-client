import { Meta, StoryObj } from "@storybook/react";

import ListLoader from "./index";

const meta = {
  title: "Skeletons/List",
  component: ListLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for list items",
      },
    },
  },
  argTypes: {
    count: {
      control: "number",
      defaultValue: 25,
      description: "Number of skeleton items to render",
    },
    withoutFirstRectangle: {
      control: "boolean",
      defaultValue: false,
      description: "Hide the first rectangle in each row",
    },
    withoutLastRectangle: {
      control: "boolean",
      defaultValue: false,
      description: "Hide the last rectangle in each row",
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
    animate: {
      control: "boolean",
      defaultValue: true,
      description: "Enable/disable animation",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ListLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 5,
  },
};

export const WithoutFirstRectangle: Story = {
  args: {
    count: 3,
    withoutFirstRectangle: true,
  },
};

export const WithoutLastRectangle: Story = {
  args: {
    count: 3,
    withoutLastRectangle: true,
  },
};

export const WithoutBothRectangles: Story = {
  args: {
    count: 3,
    withoutFirstRectangle: true,
    withoutLastRectangle: true,
  },
};

export const CustomColors: Story = {
  args: {
    count: 3,
    backgroundColor: "#e3f2fd",
    foregroundColor: "#2196f3",
  },
};

export const SlowAnimation: Story = {
  args: {
    count: 3,
    speed: 4,
  },
};

export const NoAnimation: Story = {
  args: {
    count: 3,
    animate: false,
  },
};
