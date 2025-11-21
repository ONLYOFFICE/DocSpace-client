// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.

import React, { useState, ChangeEvent } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Slider } from ".";
import { SliderProps } from "./Slider.types";

const meta: Meta<typeof Slider> = {
  title: "Form Controls/Slider",
  component: Slider,
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    value: { control: "number" },
    isDisabled: { control: "boolean" },
    withPouring: { control: "boolean" },
    onChange: { action: "onChange" },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    isDisabled: false,
    withPouring: true,
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

const SliderWithState = (props: SliderProps) => {
  const { value: initialValue, onChange } = props;
  const [value, setValue] = useState<number>(initialValue || 50);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange?.(e);
  };

  return <Slider {...props} value={value} onChange={handleChange} />;
};

export const Default: Story = {
  render: (args) => <SliderWithState {...args} />,
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
  render: (args) => <SliderWithState {...args} />,
};

export const WithCustomSteps: Story = {
  args: {
    min: 0,
    max: 10,
    step: 5,
    value: 5,
  },
  render: (args) => <SliderWithState {...args} />,
};

export const WithoutPouring: Story = {
  args: {
    withPouring: false,
  },
  render: (args) => <SliderWithState {...args} />,
};

export const WithCustomSize: Story = {
  args: {
    thumbWidth: "24px",
    thumbHeight: "24px",
    thumbBorderWidth: "2px",
    runnableTrackHeight: "8px",
  },
  render: (args) => (
    <div style={{ width: "300px", padding: "20px" }}>
      <SliderWithState {...args} />
    </div>
  ),
};

export const RTL: Story = {
  parameters: {
    direction: "rtl",
  },
  render: (args) => (
    <div dir="rtl" style={{ width: "300px", padding: "20px" }}>
      <SliderWithState {...args} />
    </div>
  ),
};
