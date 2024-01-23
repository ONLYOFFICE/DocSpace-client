import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import { ColorInput } from "./ColorInput";
import { ColorInputProps } from "./ColorInput.types";
import { InputSize } from "../text-input/TextInput.enums";

const ColorInputContainer = styled.div`
  height: 300px;
`;

const meta = {
  title: "Components/ColorInput",
  component: ColorInput,
  argTypes: {
    size: {
      controls: "multi-select",
      options: [
        InputSize.base,
        InputSize.middle,
        InputSize.big,
        InputSize.huge,
        InputSize.large,
      ],
    },
    scale: { controls: "boolean" },
    isDisabled: { controls: "boolean" },
    hasError: { controls: "boolean" },
    hasWarning: { controls: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: "Color input",
      },
    },
  },
} satisfies Meta<typeof ColorInput>;
type Story = StoryObj<typeof meta>;
export default meta;

const Template = ({ ...args }: ColorInputProps) => {
  return (
    <ColorInputContainer>
      <ColorInput {...args} />
    </ColorInputContainer>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    defaultColor: "#4781D1",
    handleChange: (color) => {
      console.log(color);
    },
    size: InputSize.base,
    scale: false,
    isDisabled: false,
    hasError: false,
    hasWarning: false,
  },
};
