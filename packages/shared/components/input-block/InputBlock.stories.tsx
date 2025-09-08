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

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { InputBlock } from ".";
import { InputBlockProps } from "./InputBlock.types";
import { InputSize, InputType } from "../text-input";

const meta = {
  title: "Form Controls/InputBlock",
  component: InputBlock,
  argTypes: {
    iconColor: { control: "color" },
    hoverColor: { control: "color" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
    onIconClick: { action: "onIconClick" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args: InputBlockProps) => {
  const [value, setValue] = useState(args.value || "");

  return (
    <InputBlock
      {...args}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        args.onChange?.(e);
      }}
    />
  );
};

const defaultArgs: InputBlockProps = {
  id: "default-input",
  name: "default",
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
  value: "",
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: defaultArgs,
};

export const WithError: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    id: "error-input",
    hasError: true,
    placeholder: "Input with error state",
  },
};

export const WithWarning: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    id: "warning-input",
    hasWarning: true,
    placeholder: "Input with warning state",
  },
};

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    id: "disabled-input",
    isDisabled: true,
    placeholder: "Disabled input",
  },
};

export const ReadOnly: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    id: "readonly-input",
    isReadOnly: true,
    value: "Read-only content",
    placeholder: "Read-only input",
  },
};

export const Password: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    id: "password-input",
    type: InputType.password,
    placeholder: "Enter password",
  },
};

export const Sizes: Story = {
  args: defaultArgs,
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Template
        {...defaultArgs}
        id="base-size"
        size={InputSize.base}
        placeholder="Base size"
      />
      <Template
        {...defaultArgs}
        id="middle-size"
        size={InputSize.middle}
        placeholder="Middle size"
      />
      <Template
        {...defaultArgs}
        id="large-size"
        size={InputSize.large}
        placeholder="Large size"
      />
    </div>
  ),
};
