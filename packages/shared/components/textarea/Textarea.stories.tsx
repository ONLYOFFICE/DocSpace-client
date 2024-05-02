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

import { Textarea } from "./Textarea";
import { TextareaProps } from "./Textarea.types";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: "Textarea is used for displaying custom textarea",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    onChange: { action: "onChange" },
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
        if (e.target.value) {
          onChange?.(e);
          setValue(e.target.value);
        }
      }}
      {...args}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Add comment",
    isDisabled: false,
    isReadOnly: false,
    hasError: false,
    maxLength: 1000,
    id: "",
    name: "",
    tabIndex: 1,
    fontSize: 13,
    heightTextArea: "89px",
    value:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae",
    isJSONField: false,
    enableCopy: false,
    hasNumeration: false,
    isFullHeight: false,
  },
};

// Default.parameters = {
//   design: {
//     type: "figma",
//     url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=3399-102679&mode=design&t=TBNCKMQKQMxr44IZ-0",
//   },
// };

export const JsonViewer: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Input JSON into value prop",
    isDisabled: false,
    isReadOnly: true,
    hasError: false,
    maxLength: 1000,
    id: "",
    name: "",
    tabIndex: 1,
    fontSize: 13,
    heightTextArea: "89px",
    value:
      '{"menu": {"id": "file","value": "File","popup": {"menuitem": [{"value": "New", "onclick": "CreateNewDoc()"},{"value": "Open", "onclick": "OpenDoc()"},{"value": "Close", "onclick": "CloseDoc()"}]}}}',
    isJSONField: true,
    enableCopy: true,
    hasNumeration: true,
    isFullHeight: true,
  },
};
