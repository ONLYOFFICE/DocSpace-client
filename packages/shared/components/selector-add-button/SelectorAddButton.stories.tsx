import { Meta, StoryObj } from "@storybook/react";

import { SelectorAddButton } from "./SelectorAddButton";

const meta = {
  title: "Components/SelectorAddButton",
  component: SelectorAddButton,
  argTypes: { onClick: { action: "onClose" } },
} satisfies Meta<typeof SelectorAddButton>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: { isDisabled: false, title: "Add item" },
};
