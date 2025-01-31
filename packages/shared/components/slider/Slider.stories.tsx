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
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./index";
import { SliderProps } from "./Slider.types";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "A customizable slider component that allows users to select a value from a range.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=505-4112&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    min: {
      description: "Minimum value of the slider",
      control: { type: "number" },
    },
    max: {
      description: "Maximum value of the slider",
      control: { type: "number" },
    },
    value: {
      description: "Current value of the slider",
      control: { type: "number" },
    },
    step: {
      description: "Step increment value",
      control: { type: "number" },
    },
    thumbWidth: {
      description: "Width of the slider thumb",
      control: { type: "text" },
    },
    thumbHeight: {
      description: "Height of the slider thumb",
      control: { type: "text" },
    },
    thumbBorderWidth: {
      description: "Border width of the slider thumb",
      control: { type: "text" },
    },
    runnableTrackHeight: {
      description: "Height of the slider track",
      control: { type: "text" },
    },
    isDisabled: {
      description: "Whether the slider is disabled",
      control: { type: "boolean" },
    },
    withPouring: {
      description: "Whether to show background color in the track",
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Slider>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }: SliderProps) => {
  const [value, setValue] = useState(args.value || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    args.onChange?.(e);
  };

  return <Slider {...args} value={value} onChange={handleChange} />;
};

export const Default: Story = {
  render: Template,
  args: {
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    thumbWidth: "24px",
    thumbHeight: "24px",
    thumbBorderWidth: "6px",
    runnableTrackHeight: "8px",
    withPouring: true,
  },
};

export const CustomSized: Story = {
  render: Template,
  args: {
    min: 0,
    max: 100,
    value: 75,
    step: 1,
    thumbWidth: "30px",
    thumbHeight: "30px",
    thumbBorderWidth: "6px",
    runnableTrackHeight: "14px",
    withPouring: true,
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    min: 0,
    max: 100,
    value: 25,
    step: 1,
    thumbWidth: "24px",
    thumbHeight: "24px",
    thumbBorderWidth: "6px",
    runnableTrackHeight: "8px",
    isDisabled: true,
    withPouring: true,
  },
};

export const PreciseControl: Story = {
  render: Template,
  args: {
    min: 0,
    max: 1,
    value: 0.5,
    step: 0.01,
    thumbWidth: "24px",
    thumbHeight: "24px",
    thumbBorderWidth: "6px",
    runnableTrackHeight: "8px",
    withPouring: true,
  },
};

export const WithoutPouring: Story = {
  render: Template,
  args: {
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    thumbWidth: "24px",
    thumbHeight: "24px",
    thumbBorderWidth: "6px",
    runnableTrackHeight: "8px",
    withPouring: false,
  },
};
