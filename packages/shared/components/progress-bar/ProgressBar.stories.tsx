import { Meta, StoryObj } from "@storybook/react";

import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          "A container that displays a process or operation as a progress bar",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=991%3A43382&mode=dev",
    },
  },
} satisfies Meta<typeof ProgressBar>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    label: "Operation in progress...",
    percent: 20,
    isInfiniteProgress: false,
  },
};
