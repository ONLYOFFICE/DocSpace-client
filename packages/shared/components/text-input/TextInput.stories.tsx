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
import { TextInput } from ".";
import { InputSize, InputType } from "./TextInput.enums";
import type { TextInputProps } from "./TextInput.types";

const meta = {
  title: "Form Controls/TextInput",
  component: TextInput,
  parameters: {
    docs: {
      description: {
        component:
          "Input field for single-line strings with various styling options and features including masking, scaling, and different states.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=633-3686&mode=dev",
    },
  },
  argTypes: {
    size: {
      description: "Size variant of the input",
      control: "select",
      options: Object.values(InputSize),
    },
    type: {
      control: "select",
      options: Object.values(InputType),
    },
  },
} satisfies Meta<typeof TextInput>;

type Story = StoryObj<typeof TextInput>;

export default meta;

const Template = ({
  onChange,
  value,
  type,
  placeholder,
  size,
  isDisabled,
  isReadOnly,
  hasError,
  hasWarning,
  scale,
  withBorder,
  maxLength,
  autoComplete,
  tabIndex,
  mask,
  guide,
  keepCharPositions,
}: TextInputProps) => {
  const [val, setValue] = useState(value);

  return (
    <TextInput
      type={type || InputType.text}
      placeholder={placeholder || "Enter text here"}
      value={val}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
      size={size}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      hasError={hasError}
      hasWarning={hasWarning}
      scale={scale}
      withBorder={withBorder}
      maxLength={maxLength}
      autoComplete={autoComplete}
      tabIndex={tabIndex}
      mask={mask}
      guide={guide}
      keepCharPositions={keepCharPositions}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Enter text here",
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
    value: "",
  },
};

export const WithMask: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    mask: [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/],
    placeholder: "DD/MM/YYYY",
    guide: true,
    keepCharPositions: true,
  },
};

export const WithError: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    hasError: true,
    value: "Invalid input",
  },
};

export const WithWarning: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    hasWarning: true,
    value: "Warning state",
  },
};

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isDisabled: true,
    value: "Disabled input",
  },
};

export const ReadOnly: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isReadOnly: true,
    value: "Read only input",
  },
};

export const Password: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    type: InputType.password,
    placeholder: "Enter password",
  },
};

export const Scaled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    scale: true,
    value: "Scaled input",
  },
};

export const Large: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    size: InputSize.large,
    placeholder: "Large input",
  },
};
