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

import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { CheckboxProps } from "./Checkbox.types";
import { Checkbox } from ".";

const meta = {
  title: "Form Controls/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: { component: "Custom checkbox input" },
    },
  },
  argTypes: {
    onChange: {
      action: "onChange",
    },
    isChecked: {
      control: { type: "boolean" },
    },
    isDisabled: {
      control: { type: "boolean" },
    },
    isIndeterminate: {
      control: { type: "boolean" },
    },
    label: {
      control: { type: "text" },
    },
    hasError: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;
export default meta;

const CheckboxTemplate = (args: CheckboxProps) => <Checkbox {...args} />;

export const Default: Story = {
  render: CheckboxTemplate,
  args: {
    label: "Default Checkbox",
  },
};

export const Checked: Story = {
  render: CheckboxTemplate,
  args: {
    isChecked: true,
    label: "Checked Checkbox",
  },
};

export const Disabled: Story = {
  render: CheckboxTemplate,
  args: {
    isDisabled: true,
    label: "Disabled Checkbox",
  },
};

export const Indeterminate: Story = {
  render: CheckboxTemplate,
  args: {
    isIndeterminate: true,
    label: "Indeterminate Checkbox",
  },
};

export const WithLabel: Story = {
  render: CheckboxTemplate,
  args: {
    label: "Checkbox with Label",
  },
};

export const CheckboxWithError: Story = {
  render: CheckboxTemplate,
  args: {
    label: "Checkbox with Error",
    isChecked: true,
    hasError: true,
  },
};
