import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { TimePicker } from "./TimePicker";
import { TimePickerProps } from "./TimePicker.types";

const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  argTypes: {
    hasError: { control: "boolean" },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Time input",
      },
    },
  },
} satisfies Meta<typeof TimePicker>;
type Story = StoryObj<typeof meta>;
export default meta;

const Template = ({ ...args }: TimePickerProps) => {
  return <TimePicker hasError={false} {...args} />;
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    initialTime: {},
    onChange: () => {},
  },
};
