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

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import MailReactSvgUrl from "PUBLIC_DIR/images/mail.react.svg?url";
import CatalogPinReactSvgUrl from "PUBLIC_DIR/images/catalog.pin.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import MediaMuteReactSvgUrl from "PUBLIC_DIR/images/media.mute.react.svg?url";
import NavLogoReactSvg from "PUBLIC_DIR/images/nav.logo.react.svg?url";
import PersonReactSvg from "PUBLIC_DIR/images/person.react.svg?url";
import QuestionReactSvg from "PUBLIC_DIR/images/question.react.svg?url";
import SettingsReactSvg from "PUBLIC_DIR/images/settings.react.svg?url";

import { IconButton } from ".";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: { component: "IconButton is used for a action on a page" },
    },
  },
  argTypes: {
    color: { control: "color" },
    clickColor: { control: "color" },
    hoverColor: { control: "color" },
    onClick: { action: "onClick" },
    iconName: {
      control: {
        type: "select",
      },
      options: [
        SearchReactSvgUrl,
        EyeReactSvgUrl,
        InfoReactSvgUrl,
        MailReactSvgUrl,
        CatalogPinReactSvgUrl,
        CrossReactSvgUrl,
        MediaMuteReactSvgUrl,
        NavLogoReactSvg,
        PersonReactSvg,
        QuestionReactSvg,
        SettingsReactSvg,
      ],
    },
  },
} satisfies Meta<typeof IconButton>;
type Story = StoryObj<typeof IconButton>;
export default meta;

export const Default: Story = {
  render: (args) => <IconButton {...args} />,
  args: {
    size: 25,
    iconName: SearchReactSvgUrl,
    isFill: true,
    isDisabled: false,
  },
};
