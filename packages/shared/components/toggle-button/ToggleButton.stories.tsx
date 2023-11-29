import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { ToggleButton } from ".";
import { ToggleButtonProps } from "./ToggleButton.types";

const meta = {
  title: "Components/ToggleButton",
  component: ToggleButton,
  parameters: {
    docs: { description: { component: "Custom toggle button input" } },
  },
  argTypes: {
    onChange: { action: "onChange" },
  },
} satisfies Meta<typeof ToggleButton>;
type Story = StoryObj<typeof ToggleButton>;

export default meta;

const Template = ({ isChecked, onChange, ...args }: ToggleButtonProps) => {
  const [value, setValue] = useState(isChecked);
  return (
    <ToggleButton
      {...args}
      isChecked={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target?.checked);
        onChange(e);
      }}
    />
  );
};

export const Default: Story = {
  render: Template,
  args: {
    id: "toggle id",
    className: "toggle className",
    isDisabled: false,
    label: "label text",
    isChecked: false,
  },
};
