import React, { useState } from "react";
import ToggleButton from "./";

export default {
  title: "Components/ToggleButton",
  component: ToggleButton,
  parameters: {
    docs: { description: { component: "Custom toggle button input" } },
  },
  argTypes: {
    onChange: { action: "onChange" },
  },
};

const Template = ({
  isChecked,
  onChange,
  ...args
}: any) => {
  const [value, setValue] = useState(isChecked);
  return (
    <ToggleButton
      {...args}
      isChecked={value}
      onChange={(e: any) => {
        setValue(e.target.checked);
        onChange(e);
      }}
    />
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ isCheck... Remove this comment to see the full error message
Default.args = {
  id: "toggle id",
  className: "toggle className",
  isDisabled: false,
  label: "label text",
  isChecked: false,
};
