import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./Label";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component: "Component displays the field name in the form",
      },
    },
  },
  argTypes: {
    // color: { control: "color" },
    // backgroundColor: { control: "color" },
    // exampleText: {
    //   table: {
    //     disable: true,
    //   },
    // },
  },
} satisfies Meta<typeof Label>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Label {...args}>Test label</Label>
    </div>
  ),
  args: {
    title: "",
    htmlFor: "",
    truncate: false,

    isInline: false,
  },
};
