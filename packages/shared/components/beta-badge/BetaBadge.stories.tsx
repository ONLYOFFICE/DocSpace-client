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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Meta, StoryObj } from "@storybook/react";

import { BetaBadge } from ".";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";
import { BetaBadgeProps } from "./BetaBadge.types";
import { DeviceType } from "../../enums";

const meta: Meta<typeof BetaBadge> = {
  title: "Components/BetaBadge",
  component: BetaBadge,
  parameters: {
    docs: {
      description: {
        component: `A badge indicating beta status, used to signify features under development or testing.

### Accessibility
- Provides clear visual indication of beta features
- Includes support links and documentation for users
- Adapts to different device types and color schemes`,
      },
    },
  },
  argTypes: {
    documentationEmail: {
      description: "Email for documentation support",
      control: { type: "text" },
    },
    currentColorScheme: {
      description: "Current color scheme of the badge",
      control: { type: "object" },
    },
    currentDeviceType: {
      description: "Type of device the badge is displayed on",
      control: { type: "select", options: Object.values(DeviceType) },
    },
    forumLink: {
      description: "Link to the forum for discussions",
      control: { type: "text" },
    },
    place: {
      description: "Position of the badge",
      control: {
        type: "select",
        options: ["top-start", "top-end", "bottom-start", "bottom-end"],
      },
    },
    withOutFeedbackLink: {
      description: "Whether to show feedback link",
      control: { type: "boolean" },
    },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof BetaBadge>;

export default meta;
type Story = StoryObj<typeof BetaBadge>;

const Template = (args: BetaBadgeProps) => <BetaBadge {...args} />;

export const Default: Story = {
  render: (args) => Template(args),
  args: {
    documentationEmail: "support@example.com",
    currentDeviceType: DeviceType.desktop,
    forumLinkUrl: "https://forum.example.com",
  },
};

const ThemeTemplate = () => (
  <BetaBadge
    documentationEmail="support@example.com"
    currentDeviceType={DeviceType.desktop}
    currentColorScheme={{ main: { accent: "#4781d1" } }}
    forumLinkUrl="https://forum.example.com"
  />
);

export const Themes: Story = {
  render: () => ThemeTemplate(),
};
