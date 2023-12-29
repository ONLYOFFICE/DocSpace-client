import { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: "Used for buttons, numbers or status markers next to icons.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=6057-171831&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof Badge>;
type Story = StoryObj<typeof Badge>;

export default meta;

export const Default: Story = {
  args: {
    label: 24,
  },
};
export const NumberBadge: Story = {
  args: {
    label: 3,
  },
  argTypes: {
    label: { control: "number" },
  },
};

export const TextBadge: Story = {
  args: {
    label: "New",
  },
  argTypes: {
    label: { control: "text" },
  },
};

export const MixedTemplate: Story = {
  args: {
    label: "Ver.2",
  },
  argTypes: {
    label: { control: "text" },
  },
};

export const HighBadge: Story = {
  args: {
    type: "high",
    label: "High",
    backgroundColor: "#f2675a",
  },
  argTypes: {
    type: { control: "radio" },
  },
};
