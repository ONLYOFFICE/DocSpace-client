/* eslint-disable no-console */
import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { ColorPicker } from "./ColorPicker";
import { ColorPickerProps } from "./ColorPicker.types";

const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  argTypes: {
    appliedColor: { control: "color" },
  },
  parameters: {
    docs: {
      description: {
        component: "Color input",
      },
    },
  },
} satisfies Meta<typeof ColorPicker>;
type Story = StoryObj<typeof meta>;
export default meta;

const Template = ({ ...args }: ColorPickerProps) => {
  return <ColorPicker {...args} />;
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    isPickerOnly: false,
    appliedColor: "#4781D1",
    onClose: () => console.log("close"),
    applyButtonLabel: "Apply",
    cancelButtonLabel: "Cancel",
  },
};
