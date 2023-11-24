import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Text } from ".";

const meta = {
  title: "Components/Text",
  component: Text,
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
} satisfies Meta<typeof Text>;

type Story = StoryObj<typeof Text>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>Test text</Text>
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
