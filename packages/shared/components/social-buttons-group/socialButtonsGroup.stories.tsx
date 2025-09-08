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
import { Meta, StoryFn } from "@storybook/react";
import { SocialButtonsGroup } from "./index";
import type { SocialButtonProps } from "./SocialButtonsGroup.types";

const mockTranslation = (key: string) => {
  const translations: { [key: string]: string } = {
    "Common:ContinueWith": "Continue with",
    "Common:ContinueButton": "Continue",
    "Common:ProviderFacebook": "Continue with Facebook",
    "Common:ProviderGoogle": "Continue with Google",
    "Common:ProviderLinkedIn": "Continue with LinkedIn",
    "Common:ProviderTwitter": "Continue with X",
  };
  return translations[key] || key;
};

export default {
  title: "Components/SocialButtonsGroup",
  component: SocialButtonsGroup,
  parameters: {
    docs: {
      description: {
        component:
          "A group of social login buttons with support for SSO and additional providers through a 'More' button",
      },
    },
  },
  argTypes: {
    providers: {
      control: "object",
      description:
        "Array of social providers configuration. Each provider has properties: provider (string), url (string), linked (boolean)",
    },
    onClick: {
      action: "clicked",
      description:
        "Callback function triggered when a social button is clicked",
    },
    onMoreAuthToggle: {
      action: "more auth toggled",
      description:
        "Callback function triggered when the 'More' button is clicked to show additional providers",
    },
    isDisabled: {
      control: "boolean",
      description: "When true, disables all social buttons in the group",
    },
    ssoUrl: {
      control: "text",
      description: "URL for Single Sign-On (SSO) authentication",
    },
    ssoLabel: {
      control: "text",
      description: "Label text for the SSO button",
    },
  },
} as Meta;

const StorybookSocialButtonsGroup = (props: SocialButtonProps) => {
  const { onClick, ...restProps } = props;
  const handleClick: (e: React.MouseEvent<Element, MouseEvent>) => void = (
    e,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
    }
  };

  const modifiedProps = { ...restProps, onClick: handleClick };

  if (props.ssoUrl) {
    modifiedProps.ssoUrl = "javascript:void(0);";
  }

  return <SocialButtonsGroup {...modifiedProps} />;
};

const Template: StoryFn<SocialButtonProps> = (args) => (
  <StorybookSocialButtonsGroup {...args} />
);

export const Default = Template.bind({});
Default.args = {
  providers: [
    { provider: "google", url: "google.com", linked: false },
    { provider: "facebook", url: "facebook.com", linked: false },
  ],
  t: mockTranslation,
  isDisabled: false,
};

export const WithSSO = Template.bind({});
WithSSO.args = {
  ...Default.args,
  ssoUrl: "sso-url.com",
  ssoLabel: "SSO Login",
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  isDisabled: true,
};

export const WithMoreProviders = Template.bind({});
WithMoreProviders.args = {
  ...Default.args,
  providers: [
    { provider: "google", url: "google.com", linked: false },
    { provider: "facebook", url: "facebook.com", linked: false },
    { provider: "twitter", url: "twitter.com", linked: false },
    { provider: "linkedin", url: "linkedin.com", linked: false },
  ],
};
