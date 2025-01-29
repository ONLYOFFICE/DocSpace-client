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

import { Meta, StoryObj } from "@storybook/react";

import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";
import ShareLinkedinReactSvgUrl from "PUBLIC_DIR/images/share.linkedin.react.svg?url";
import GoogleIcon from "PUBLIC_DIR/images/share.google.react.svg";
import LinkedinIcon from "PUBLIC_DIR/images/share.linkedin.react.svg";

import { SocialButton } from "./SocialButton";

type SocialButtonType = typeof SocialButton;
type Story = StoryObj<SocialButtonType>;

const meta: Meta<SocialButtonType> = {
  title: "Components/SocialButtons",
  component: SocialButton,
  parameters: {
    docs: {
      description: {
        component:
          "Button component for social network authentication and sharing",
      },
    },
  },
  argTypes: {
    onClick: { action: "onClick" },
    iconName: {
      control: {
        type: "select",
        options: [ShareGoogleReactSvgUrl, ShareLinkedinReactSvgUrl],
      },
    },
    size: {
      control: {
        type: "radio",
        options: ["base", "small"],
      },
    },
    label: {
      control: "text",
    },
    isConnect: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    noHover: {
      control: "boolean",
    },
    $iconOptions: {
      control: "object",
    },
  },
  args: {
    label: "Continue with Google",
    size: "base",
    isConnect: false,
    isDisabled: false,
    noHover: false,
    tabIndex: 0,
  },
};

export default meta;

export const Default: Story = {
  args: {
    IconComponent: GoogleIcon,
  },
};

export const Small: Story = {
  args: {
    IconComponent: GoogleIcon,
    size: "small",
  },
};

export const Connected: Story = {
  args: {
    IconComponent: GoogleIcon,
    isConnect: true,
  },
};

export const Disabled: Story = {
  args: {
    IconComponent: GoogleIcon,
    isDisabled: true,
  },
};

export const CustomIconColor: Story = {
  args: {
    IconComponent: GoogleIcon,
    $iconOptions: {
      color: "#FF0000",
    },
  },
};

export const NoHover: Story = {
  args: {
    IconComponent: GoogleIcon,
    noHover: true,
  },
};

export const WithLinkedin: Story = {
  args: {
    IconComponent: LinkedinIcon,
    label: "Continue with LinkedIn",
  },
};

export const IconOnly: Story = {
  args: {
    IconComponent: GoogleIcon,
    label: "",
  },
};
