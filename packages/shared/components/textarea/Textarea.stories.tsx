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

import React, { ChangeEvent, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Textarea } from ".";
import { TextareaProps } from "./Textarea.types";

const meta = {
  title: "Form Controls/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "A flexible textarea component that supports various features like JSON formatting, copy functionality, and custom styling.",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    onChange: { action: "onChange" },
    isDisabled: {
      control: "boolean",
      description: "Disables the textarea input",
    },
    isReadOnly: {
      control: "boolean",
      description: "Makes the textarea read-only",
    },
    hasError: {
      control: "boolean",
      description: "Displays the textarea in an error state",
    },
    enableCopy: {
      control: "boolean",
      description: "Shows a copy button to copy the textarea content",
    },
    isJSONField: {
      control: "boolean",
      description: "Formats the content as JSON with proper indentation",
    },
    fontSize: {
      control: { type: "number", min: 8, max: 24 },
      description: "Font size of the textarea text",
    },
    heightTextArea: {
      control: "text",
      description: "Height of the textarea (e.g., '89px', '200px')",
    },
    isFullHeight: {
      control: "boolean",
      description: "Makes the textarea take full height of its container",
    },
  },
} satisfies Meta<typeof Textarea>;

type Story = StoryObj<typeof Textarea>;

export default meta;

const Template = ({ value, onChange, ...args }: TextareaProps) => {
  const [val, setValue] = useState(value);
  return (
    <Textarea
      value={val}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
        setValue(e.target.value);
      }}
      {...args}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Add your text here...",
    value: "This is a default textarea with standard configuration.",
    isDisabled: false,
    isReadOnly: false,
    hasError: false,
    maxLength: 1000,
    fontSize: 13,
    heightTextArea: "89px",
  },
};

export const WithCopyButton: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    value: "This content can be copied using the copy button.",
    enableCopy: true,
    copyInfoText: "Content copied to clipboard!",
  },
};

export const JSONFormatter: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    value: JSON.stringify({
      name: "DocSpace",
      version: "1.0.0",
      features: ["JSON formatting", "Copy button", "Custom styling"],
      active: true,
    }),
    isJSONField: true,
    heightTextArea: "200px",
    enableCopy: true,
  },
};

export const ReadOnly: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    value: "This is a read-only textarea. You cannot edit this content.",
    isReadOnly: true,
  },
};

export const WithError: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    value: "This textarea is in an error state.",
    hasError: true,
  },
};

export const CustomStyling: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    value: "This textarea has custom styling with larger font and height.",
    fontSize: 16,
    heightTextArea: "150px",
    color: "#2B4C7F",
  },
};
