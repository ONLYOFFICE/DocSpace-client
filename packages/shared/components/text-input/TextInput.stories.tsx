import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { TextInputPure } from "./TextInput";
import { TextInputProps } from "./TextInput.types";
import { InputSize, InputType } from "./TextInput.enums";

const meta = {
  title: "Components/TextInput",
  component: TextInputPure,
  parameters: {
    docs: {
      description: {
        component: "Input field for single-line strings",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=633-3686&mode=dev",
    },
  },
  argTypes: {
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
    onChange: { action: "onChange" },
    scale: { description: "Indicates that the input field has scaled" },
  },
} satisfies Meta<typeof TextInputPure>;
type Story = StoryObj<typeof TextInputPure>;

export default meta;

const Template = ({ onChange, value, ...args }: TextInputProps) => {
  const [val, setValue] = useState(value);

  return (
    <TextInputPure
      {...args}
      value={val}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    id: "",
    name: "",
    placeholder: "This is placeholder",
    maxLength: 255,
    size: InputSize.base,
    type: InputType.text,
    isAutoFocussed: false,
    isDisabled: false,
    isReadOnly: false,
    hasError: false,
    hasWarning: false,
    scale: false,
    autoComplete: "off",
    tabIndex: 1,
    withBorder: true,
    mask: undefined,
    value: "",
  },
};
