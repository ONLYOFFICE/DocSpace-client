import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { InputBlock } from "./InputBlock";

import { InputSize, InputType } from "../text-input";
import { InputBlockProps } from "./InputBlock.types";

const meta = {
  title: "Components/InputBlock",
  component: InputBlock,
  argTypes: {
    iconColor: { control: "color" },
    hoverColor: { control: "color" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
    onIconClick: { action: "onIconClick" },
    // optionsMultiSelect: {
    //   control: {
    //     type: "multi-select",
    //     options: ["button", "icon"],
    //   },
    // },
  },
} satisfies Meta<typeof InputBlock>;
type Story = StoryObj<typeof InputBlock>;

export default meta;

const Template = ({ onChange, ...args }: InputBlockProps) => {
  const [value, setValue] = useState("");

  const children: React.ReactNode[] = [];

  return (
    <InputBlock
      {...args}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
    >
      {children}
    </InputBlock>
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
    isAutoFocussed: false,
    isReadOnly: false,
    hasError: false,
    hasWarning: false,
    scale: false,
    autoComplete: "off",
    tabIndex: 1,
    iconSize: 0,
    type: InputType.text,
    isDisabled: false,
    iconName: SearchReactSvgUrl,
    isIconFill: false,
  },
};
