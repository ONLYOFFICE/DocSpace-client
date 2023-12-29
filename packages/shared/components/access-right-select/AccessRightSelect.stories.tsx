import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { ComboBoxSize } from "../combobox";

import { AccessRightSelect } from "./AccessRightSelect";
import { AccessRightSelectProps } from "./AccessRightSelect.types";

import { data } from "./data";

const meta = {
  title: "Components/AccessRightSelect",
  component: AccessRightSelect,
} satisfies Meta<typeof AccessRightSelect>;
type Story = StoryObj<typeof AccessRightSelect>;

export default meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: "420px",
    }}
  >
    {children}
  </div>
);

const Template = (args: AccessRightSelectProps) => (
  <Wrapper>
    <AccessRightSelect {...args} />
  </Wrapper>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    accessOptions: data,
    selectedOption: data[0],
    scaledOptions: false,
    scaled: false,
    directionX: "left",
    size: ComboBoxSize.content,
    manualWidth: "fit-content",
  },
};
