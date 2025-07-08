import { Meta, StoryObj } from "@storybook/react";

import RowLoader from "./Row";

const meta = {
  title: "Skeletons/Selector/Row",
  component: RowLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for selector rows",
      },
    },
  },
  argTypes: {
    count: {
      control: "number",
      defaultValue: 3,
      description: "Number of rows to display",
    },
    isMultiSelect: {
      control: "boolean",
      defaultValue: false,
      description: "Show checkbox for multiple selection",
    },
    isContainer: {
      control: "boolean",
      defaultValue: true,
      description: "Render as a container with multiple rows",
    },
    isUser: {
      control: "boolean",
      defaultValue: false,
      description: "Apply user-specific styling (rounded avatar)",
    },
    withAllSelect: {
      control: "boolean",
      defaultValue: false,
      description: "Show 'select all' option at the top",
    },
    style: {
      control: "object",
      description: "Custom styles for the container",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RowLoader>;

export default meta;

type Story = StoryObj<typeof RowLoader>;

export const Default: Story = {
  args: {
    count: 3,
    isContainer: true,
  },
};

export const MultiSelect: Story = {
  args: {
    ...Default.args,
    isMultiSelect: true,
    withAllSelect: true,
  },
};

export const User: Story = {
  args: {
    ...Default.args,
    isUser: true,
    isMultiSelect: true,
  },
};

export const Single: Story = {
  args: {
    isContainer: false,
    isMultiSelect: true,
  },
};
