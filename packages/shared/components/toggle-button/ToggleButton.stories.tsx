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

import React, { useEffect, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import type { ToggleButtonProps } from "./ToggleButton.types";
import { ToggleButton } from ".";

const meta = {
  title: "Form Controls/ToggleButton",
  component: ToggleButton,
  parameters: {
    docs: {
      description: {
        component:
          "A customizable toggle button component that supports various states and styling options.",
      },
    },
  },
  argTypes: {
    onChange: { action: "onChange" },
    isChecked: {
      control: "boolean",
      description: "Controls the checked state of the toggle",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the toggle button",
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading animation",
    },
    label: {
      control: "text",
      description: "Text label for the toggle",
    },
    noAnimation: {
      control: "boolean",
      description: "Disables animation effects",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ToggleButton>;

type Story = StoryObj<typeof ToggleButton>;

export default meta;

const Template = ({ isChecked, ...args }: ToggleButtonProps) => {
  const [checked, setChecked] = useState(isChecked);

  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  return <ToggleButton {...args} isChecked={checked} onChange={handleChange} />;
};

export const Default: Story = {
  render: Template,
  args: {
    label: "Toggle me",
    isChecked: false,
  },
};

export const Checked: Story = {
  render: Template,
  args: {
    ...Default.args,
    isChecked: true,
  },
};

export const WithoutLabel: Story = {
  render: Template,
  args: {
    ...Default.args,
    label: undefined,
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const DisabledChecked: Story = {
  render: Template,
  args: {
    ...Default.args,
    isDisabled: true,
    isChecked: true,
  },
};

export const Loading: Story = {
  render: Template,
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const WithoutAnimation: Story = {
  render: Template,
  args: {
    ...Default.args,
    noAnimation: true,
  },
};
