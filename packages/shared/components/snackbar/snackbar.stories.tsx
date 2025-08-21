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

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import React from "react";

import { SnackBar } from "./Snackbar";
import type { SnackbarProps } from "./Snackbar.types";
import { TextAlignValue } from "../box/Box.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/SnackBar",
  component: SnackBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "SnackBar is a component for displaying temporary notifications, alerts, or messages to users. It can be customized with various styles and behaviors.",
      },
    },
  },
  argTypes: {
    text: {
      control: "text",
      description: "Main message text",
    },
    headerText: {
      control: "text",
      description: "Header text displayed above the main message",
    },
    btnText: {
      control: "text",
      description: "Text for the action button",
    },
    textColor: {
      control: "color",
      description: "Color of the text content",
    },
    backgroundColor: {
      control: "color",
      description: "Background color of the snackbar",
    },
    showIcon: {
      control: "boolean",
      description: "Whether to show the icon",
    },
    countDownTime: {
      control: "number",
      description: "Time in milliseconds before auto-dismissal",
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the snackbar",
    },
    onAction: { action: "onAction" },
    onClose: { action: "onClose" },
    onLoad: { action: "onLoad" },
  },
} satisfies Meta<typeof SnackBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  backgroundImg: "",
  backgroundColor: globalColors.lightToastInfo,
  textColor: globalColors.darkBlack,
  opacity: 1,
  headerText: "Attention",
  text: "Important notification message",
  showIcon: true,
  fontSize: "13px",
  fontWeight: 400,
  textAlign: "left" as TextAlignValue,
  htmlContent: "",
  countDownTime: 0,
  sectionWidth: 500,
  onClose: fn(),
  onLoad: fn(),
  onAction: fn(),
};
const SnackBarWrapper = (args: SnackbarProps) => (
  <div data-testid="snackbar-wrapper" style={{ width: "calc(100% - 32px)" }}>
    <SnackBar {...args} />
  </div>
);

export const Default: Story = {
  args: baseArgs,
  render: (args) => <SnackBarWrapper {...args} />,
};

export const WithAction: Story = {
  args: {
    ...baseArgs,
    btnText: "Take Action",
  },
  render: (args) => <SnackBarWrapper {...args} />,
};

export const WithCountdown: Story = {
  args: {
    ...baseArgs,
    countDownTime: 5000,
    text: "This message will disappear in 5 seconds",
  },
  render: (args) => <SnackBarWrapper {...args} />,
};

export const WithHtmlContent: Story = {
  args: {
    ...baseArgs,
    htmlContent: "<img src='images/logo/lightsmall.svg' />",
    text: undefined as unknown as string,
  },
  render: (args) => <SnackBarWrapper {...args} />,
};

export const Maintenance: Story = {
  args: {
    ...baseArgs,
    isMaintenance: true,
    headerText: "Maintenance Notice",
    text: "System maintenance is scheduled for tonight at 10 PM",
    backgroundColor: globalColors.lightToastWarning,
  },
  render: (args) => <SnackBarWrapper {...args} />,
};
