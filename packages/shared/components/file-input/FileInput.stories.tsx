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

import { InputSize } from "../text-input";
import { FileInputProps } from "./FileInput.types";
import { FileInputPure } from "./FileInput";

const meta = {
  title: "Components/FileInput",
  component: FileInputPure,
  argTypes: {
    onInput: { action: "onInput" },
    size: {
      control: "select",
      options: Object.values(InputSize),
      description: "Size of the input field",
    },
    hasError: {
      control: "boolean",
      description: "Shows error state",
    },
    hasWarning: {
      control: "boolean",
      description: "Shows warning state",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the input",
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading state",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "File input component for handling file uploads with various states and sizes",
      },
    },
  },
} satisfies Meta<typeof FileInputPure>;

export default meta;
type Story = StoryObj<typeof FileInputPure>;

const Template = (args: FileInputProps) => <FileInputPure {...args} />;

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Choose file",
    size: InputSize.base,
    scale: false,
    isDisabled: false,
    "aria-label": "Choose file",
  },
};

export const Middle: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    size: InputSize.middle,
    placeholder: "Middle input",
  },
};

export const WithError: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    hasError: true,
    placeholder: "Error state",
  },
};

export const WithWarning: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    hasWarning: true,
    placeholder: "Warning state",
  },
};

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isDisabled: true,
    placeholder: "Disabled input",
  },
};

export const Loading: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isLoading: true,
    placeholder: "Loading state",
  },
};
