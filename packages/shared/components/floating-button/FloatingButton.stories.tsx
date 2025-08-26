/* eslint-disable no-alert */
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
import { FloatingButton } from ".";
import { FloatingButtonIcons } from "./FloatingButton.enums";

const meta = {
  title: "Interactive Elements/FloatingButton",
  component: FloatingButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=1053-45015&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    icon: {
      control: "select",
      options: Object.values(FloatingButtonIcons),
      description: "The icon to display in the button",
    },
    alert: {
      control: "boolean",
      description: "Show alert indicator",
    },
    color: {
      control: "color",
      description: "Custom background color",
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: "70px",
          width: "100px",
          display: "flex",
          justifyContent: "flex-start",
          position: "relative",
          padding: "20px",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: FloatingButtonIcons.upload,
  },
};

export const WithProgress: Story = {
  args: {
    icon: FloatingButtonIcons.upload,
    percent: 45,
  },
};

export const WithAlert: Story = {
  args: {
    icon: FloatingButtonIcons.upload,
    alert: true,
  },
};

export const Completed: Story = {
  args: {
    icon: FloatingButtonIcons.upload,
    completed: true,
    percent: 100,
  },
};
