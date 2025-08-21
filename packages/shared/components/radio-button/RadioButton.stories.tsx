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

import React, { useState, useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { RadioButton } from ".";
import { RadioButtonProps } from "./RadioButton.types";

const meta = {
  title: "Form Controls/RadioButton",
  component: RadioButton,
  parameters: {
    docs: {
      description: {
        component: `RadioButton is a form control that allows users to select a single option from a set of options.
          
### Features
- Support for checked and unchecked states
- Disabled state support
- Customizable label text and styling
- Horizontal and vertical orientation options
- Keyboard accessibility
- Custom styling support`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=556-3247&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    isChecked: {
      description: "Controls the checked state of the radio button",
      control: "boolean",
    },
    isDisabled: {
      description: "Disables the radio button when set to true",
      control: "boolean",
    },
    label: {
      description: "Text label displayed next to the radio button",
      control: "text",
    },
    name: {
      description: "Name attribute for the radio button input",
      control: "text",
    },
    value: {
      description: "Value attribute for the radio button input",
      control: "text",
    },
    fontSize: {
      description: "Font size of the label text",
      control: "text",
    },
    fontWeight: {
      description: "Font weight of the label text",
      control: "number",
    },
  },
} satisfies Meta<typeof RadioButton>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ isChecked, ...args }: RadioButtonProps) => {
  const [checked, setIsChecked] = useState(isChecked);

  useEffect(() => {
    setIsChecked(isChecked);
  }, [isChecked]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setIsChecked(target.checked);
  };

  return (
    <RadioButton {...args} isChecked={checked} onChange={onChangeHandler} />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    value: "value",
    name: "name",
    label: "Default radio button",
    fontSize: "13px",
    fontWeight: 400,
    isDisabled: false,
    isChecked: false,
  },
};

export const Checked: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    label: "Checked radio button",
    isChecked: true,
  },
};

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    label: "Disabled radio button",
    isDisabled: true,
  },
};

export const DisabledChecked: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    label: "Disabled checked radio button",
    isDisabled: true,
    isChecked: true,
  },
};

export const CustomStyling: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    label: "Custom styled radio button",
    fontSize: "16px",
    fontWeight: 600,
    style: { marginTop: "10px" },
  },
};
