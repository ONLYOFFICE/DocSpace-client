import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { InputSize, InputType, TextInput } from "../text-input";

import { FieldContainer } from "./FieldContainer";
import { FieldContainerProps } from "./FieldContainer.types";

const meta = {
  title: "Components/FieldContainer",
  component: FieldContainer,
  argTypes: {
    errorColor: { control: "color" },
  },
  parameters: {
    docs: {
      description: {
        component: "Responsive form field container",
      },
    },
  },
} satisfies Meta<typeof FieldContainer>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: FieldContainerProps) => {
  const [value, setValue] = useState("");

  const { hasError } = args;
  return (
    <FieldContainer {...args}>
      <TextInput
        value={value}
        hasError={hasError}
        className="field-input"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
        type={InputType.text}
        size={InputSize.base}
      />
    </FieldContainer>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    isVertical: false,
    isRequired: false,
    hasError: false,
    labelVisible: true,
    labelText: "Name:",
    maxLabelWidth: "110px",
    tooltipContent: "Paste you tooltip content here",
    helpButtonHeaderContent: "Tooltip header",
    place: "top",
    errorMessage:
      "Error text. Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
    errorColor: "#C96C27",
    errorMessageWidth: "293px",
    removeMargin: false,
    children: null,
  },
};
