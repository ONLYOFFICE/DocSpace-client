import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { FloatingButton } from "./FloatingButton";
import { FloatingButtonProps } from "./FloatingButton.types";
import { FloatingButtonIcons } from "./FloatingButton.enums";

const meta = {
  title: "components/FloatingButton",
  component: FloatingButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=1053-45015&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof FloatingButton>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: FloatingButtonProps) => (
  <div
    style={{
      height: "600px",
      display: "flex",
      justifyContent: "flex-start",
      position: "relative",
    }}
  >
    <FloatingButton {...args} />
  </div>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    id: undefined,
    className: undefined,
    style: undefined,
    icon: FloatingButtonIcons.upload,
    alert: false,
    percent: 0,
  },
};
