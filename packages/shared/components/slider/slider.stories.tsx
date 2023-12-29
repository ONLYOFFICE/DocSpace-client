import React, { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Slider } from "./Slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: { description: { component: "Components/Slider" } },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=505-4112&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof Slider>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }) => {
  const [value, setValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    setValue(+target.value);
  };

  return (
    <div style={{ width: "400px", height: "50px" }}>
      <Slider
        {...args}
        value={value}
        onChange={handleChange}
        min={0}
        max={100}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    min: 0,
    max: 5,
    value: 0,
    step: 0.1,
    withPouring: false,
  },
};
