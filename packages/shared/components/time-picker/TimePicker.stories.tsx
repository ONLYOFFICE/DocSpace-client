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
import moment from "moment";

import { TimePicker } from "./TimePicker";
import { TimePickerProps } from "./TimePicker.types";

const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  argTypes: {
    initialTime: { control: "date" },
    hasError: { control: "boolean" },
    onChange: { action: "onChange" },
    tabIndex: { control: "number" },
    focusOnRender: { control: "boolean" },
    className: { control: "text" },
    classNameInput: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Time input component that allows users to select or input time in HH:mm format",
      },
    },
  },
} satisfies Meta<typeof TimePicker>;

type Story = StoryObj<typeof meta>;
export default meta;

const Template = (args: TimePickerProps) => {
  return <TimePicker {...args} />;
};

export const Default: Story = {
  render: Template,
  args: {
    initialTime: moment("2025-01-27T10:30:00"),
    hasError: false,
    onChange: (time) => console.log("Time changed:", time?.format("HH:mm")),
    tabIndex: 0,
    focusOnRender: false,
    className: "",
  },
};

export const WithError: Story = {
  render: Template,
  args: {
    ...Default.args,
    hasError: true,
  },
};

export const FocusedOnRender: Story = {
  render: Template,
  args: {
    ...Default.args,
    focusOnRender: true,
  },
};

export const CustomStyle: Story = {
  render: Template,
  args: {
    ...Default.args,
    className: "custom-time-picker",
    classNameInput: "custom-time-input",
  },
};
