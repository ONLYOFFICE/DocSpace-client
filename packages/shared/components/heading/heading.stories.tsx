import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Heading } from "./Heading";
import { HeadingProps } from "./Heading.types";
import { HeadingLevel, HeadingSize } from "./Heading.enums";

const meta = {
  title: "Components/Heading",
  component: Heading,
  argTypes: {
    color: { control: "color" },
  },
  parameters: {
    docs: {
      description: {
        component: "Heading text structured in levels",
      },
    },
  },
} satisfies Meta<typeof Heading>;
type Story = StoryObj<typeof Heading>;

export default meta;

const Template = ({ ...args }: HeadingProps) => {
  return (
    <div style={{ margin: "7px" }}>
      <Heading {...args}>Sample text Heading</Heading>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
};

Default.args = {
  level: HeadingLevel.h1,
  title: "",
  truncate: false,
  isInline: false,
  size: HeadingSize.large,
};
