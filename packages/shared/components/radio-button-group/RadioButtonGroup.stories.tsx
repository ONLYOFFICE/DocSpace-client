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

import { RadioButtonGroup } from ".";

const meta = {
  title: "Form Controls/RadioButtonGroup",
  component: RadioButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          "RadioButtonGroup allows you to create a group of radio buttons with various configurations including horizontal/vertical layouts, disabled states, and text labels.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=556-3247&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    orientation: {
      description: "Layout orientation of the radio buttons",
      control: "radio",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
    isDisabled: {
      description: "Disable all radio buttons in the group",
      control: "boolean",
      defaultValue: false,
    },
    width: {
      description: "Width of the radio button group container",
      control: "text",
    },
    fontSize: {
      description: "Font size for radio button labels",
      control: "text",
    },
    fontWeight: {
      description: "Font weight for radio button labels",
      control: "text",
    },
    spacing: {
      description: "Spacing between radio buttons",
      control: "text",
    },
  },
} satisfies Meta<typeof RadioButtonGroup>;

type Story = StoryObj<typeof meta>;

export default meta;

const baseOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export const Default: Story = {
  args: {
    options: baseOptions,
    orientation: "horizontal",
    selected: "option1",
    onClick: (e: React.ChangeEvent<HTMLInputElement>) =>
      console.log("Selected:", e.target.value),
    spacing: "15px",
  },
};

export const VerticalLayout: Story = {
  args: {
    ...Default.args,
    orientation: "vertical",
  },
};

export const WithDisabledOption: Story = {
  args: {
    ...Default.args,
    options: [
      ...baseOptions,
      { value: "option4", label: "Disabled Option", disabled: true },
    ],
  },
};

export const AllDisabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const WithTextLabel: Story = {
  args: {
    ...Default.args,
    options: [
      { type: "text", label: "Please select an option:", value: "" },
      ...baseOptions,
    ],
  },
};

export const CustomStyling: Story = {
  args: {
    ...Default.args,
    fontSize: "16px",
    fontWeight: "600",
    spacing: "20px",
    width: "300px",
  },
};
