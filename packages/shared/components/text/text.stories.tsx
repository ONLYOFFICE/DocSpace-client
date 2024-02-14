import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TextPure } from "./Text";

const meta = {
  title: "Components/Text",
  component: TextPure,
  parameters: {
    docs: {
      description: {
        component: "Component that displays plain text",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
    // exampleText: {
    //   table: {
    //     disable: true,
    //   },
    // },
  },
} satisfies Meta<typeof TextPure>;

type Story = StoryObj<typeof TextPure>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <TextPure {...args}>Test text</TextPure>
    </div>
  ),
  args: {
    title: "",
    as: "p",
    fontSize: "13px",
    fontWeight: "400",
    truncate: false,
    backgroundColor: "",
    isBold: false,
    isItalic: false,
    isInline: false,
  },
};
