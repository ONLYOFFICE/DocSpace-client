import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Text } from "../text";
// import { Link } from "../link";

import { HelpButton } from "./HelpButton";
import { HelpButtonProps } from "./HelpButton.types";

const meta = {
  title: "Components/HelpButton",
  component: HelpButton,
  // subcomponents: { Text, Link },
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component: "HelpButton is used for a action on a page",
      },
    },
  },
} satisfies Meta<typeof HelpButton>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: HelpButtonProps) => {
  return (
    <div>
      <HelpButton {...args} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    offset: 0,
    tooltipContent: <Text fontSize="13px">Paste you tooltip content here</Text>,
    place: "right",
  },
};

const AutoTemplate = (args: HelpButtonProps) => {
  return (
    <div style={{ marginTop: "20px", marginLeft: "100px" }}>
      <HelpButton
        {...args}
        style={{ left: "20px" }}
        tooltipContent={
          <>
            <p>You can put every thing here</p>
            <ul style={{ marginBottom: 0 }}>
              <li>Word</li>
              <li>Chart</li>
              <li>Else</li>
            </ul>
          </>
        }
      />
    </div>
  );
};

export const AutoPosition: Story = {
  render: (args) => <AutoTemplate {...args} />,
  args: {
    offset: 0,
    tooltipContent: <Text fontSize="13px">Paste you tooltip content here</Text>,
    place: "right",
  },
};
