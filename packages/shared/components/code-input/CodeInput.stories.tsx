import { Meta, StoryObj } from "@storybook/react";

import { CodeInput } from "./CodeInput";

const meta = {
  title: "Components/CodeInput",
  component: CodeInput,
  parameters: {
    docs: {
      description: {
        component: "Used to display an code input.",
      },
    },
  },
} satisfies Meta<typeof CodeInput>;
type Story = StoryObj<typeof CodeInput>;

export default meta;

export const Default: Story = {
  args: {
    onSubmit: () => {},
  },
};
