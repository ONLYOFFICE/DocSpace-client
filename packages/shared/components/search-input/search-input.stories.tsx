import React, { useState } from "react";
import SearchInput from ".";
import Button from "../button";

export default {
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
};

const Template = ({
  value,
  onChange,
  ...args
}: any) => {
  const [searchValue, setSearchValue] = useState(value);

  return <>
    <SearchInput
      {...args}
      style={{ width: "20%" }}
      value={searchValue}
      onChange={(value: any) => {
        onChange(value);
        setSearchValue(value);
      }}
    />
  </>;
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ value, ... Remove this comment to see the full error message
Default.args = {
  id: "",
  isDisabled: false,
  size: "base",
  scale: false,
  placeholder: "Search",
  value: "",
};
