import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { InputSize } from "../text-input";

import { SearchInput } from "./SearchInput";
import { SearchInputProps } from "./SearchInput.types";

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=58-2238&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    onChange: { action: "onChange" },
  },
} satisfies Meta<typeof SearchInput>;
type Story = StoryObj<typeof SearchInput>;

export default meta;

const Template = ({ value, onChange, ...args }: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(value);

  return (
    <SearchInput
      {...args}
      style={{ width: "20%" }}
      value={searchValue}
      onChange={(v: string) => {
        onChange?.(v);
        setSearchValue(v);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    id: "",
    isDisabled: false,
    size: InputSize.base,
    scale: false,
    placeholder: "Search",
    value: "",
  },
};
