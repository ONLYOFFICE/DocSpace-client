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

import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import MoreLoginModal from "./index";
import type { MoreLoginModalProps } from "./MoreLoginModal.types";

import { Button } from "../../components/button";

const mockTranslation = (key: string) => {
  const translations: { [key: string]: string } = {
    "Common:ContinueWith": "Continue with",
    "Common:ContinueButton": "Continue",
    "Common:ProviderFacebook": "Continue with Facebook",
    "Common:ProviderGoogle": "Continue with Google",
  };
  return translations[key] || key;
};

export default {
  title: "Dialogs/MoreLoginModal",
  component: MoreLoginModal,
  parameters: {
    docs: {
      description: {
        component:
          "Modal dialog displaying additional login options including social providers and SSO login.",
      },
    },
  },
  argTypes: {
    visible: {
      control: "boolean",
      description: "Controls the visibility of the modal dialog",
      defaultValue: false,
    },
    onClose: {
      action: "onClose",
      description: "Callback function called when the modal is closed",
    },
    providers: {
      control: "object",
      description:
        "Array of social login providers with their configuration. Each provider has properties: linked (boolean), provider (string), url (string)",
    },
    onSocialLoginClick: {
      action: "onSocialLoginClick",
      description:
        "Callback function called when a social login button is clicked. Receives the click event as parameter",
    },
    ssoLabel: {
      control: "text",
      description: "Label text for the SSO (Single Sign-On) login button",
    },
    ssoUrl: {
      control: "text",
      description: "URL for the SSO login endpoint",
    },
    t: {
      control: false,
      description: "Translation function for internationalization",
    },
  },
} as Meta;

const Template: StoryFn<MoreLoginModalProps> = (args) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button primary label="Open Modal" onClick={() => setIsVisible(true)} />
      <MoreLoginModal
        {...args}
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  ssoLabel: "SSO Login",
  ssoUrl: "https://example.com/sso",
  t: mockTranslation,
  providers: [
    { linked: false, provider: "google", url: "https://example.com/google" },
    {
      linked: false,
      provider: "facebook",
      url: "https://example.com/facebook",
    },
  ],
};
