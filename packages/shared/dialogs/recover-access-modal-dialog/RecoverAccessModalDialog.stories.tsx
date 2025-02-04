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

import React, { useState } from "react";
import { StoryFn, Meta } from "@storybook/react";
import RecoverAccessModalDialog from "./RecoverAccessModalDialog";
import type { RecoverAccessModalDialogProps } from "./RecoverAccessModalDialog.types";
import { Button, ButtonSize } from "../../components/button";

export default {
  title: "Dialogs/RecoverAccessModalDialog",
  component: RecoverAccessModalDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Modal dialog for recovering access to the system. Allows users to submit their email and describe their access problem.",
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
      action: "closed",
      description: "Callback function called when the modal is closed",
    },
    textBody: {
      control: "text",
      description: "Main text content displayed in the modal body",
    },
    emailPlaceholderText: {
      control: "text",
      description: "Placeholder text for the email input field",
    },
    id: {
      control: "text",
      description: "Unique identifier for the modal dialog",
    },
  },
} as Meta;

const Template: StoryFn<
  Omit<RecoverAccessModalDialogProps, "visible" | "onClose">
> = (args) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <Button
        primary
        label={isVisible ? "Hide Modal" : "Show Modal"}
        onClick={() => setIsVisible(!isVisible)}
        size={ButtonSize.medium}
      />
      <RecoverAccessModalDialog
        {...args}
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </div>
  );
};

export const CustomContent = Template.bind({});
CustomContent.args = {
  ...Template.args,
  textBody:
    "If you've lost access to your account, we're here to help. Please provide your registered email address and explain what happened.",
  emailPlaceholderText: "your.email@example.com",
};
CustomContent.parameters = {
  docs: {
    description: {
      story: "Modal dialog with custom text content and email placeholder.",
    },
  },
};

export const LongContent = Template.bind({});
LongContent.args = {
  ...Template.args,
  textBody:
    "This is a longer explanation of the recovery process. We take account security seriously. To help you regain access to your account, we need to verify your identity. Please provide your registered email address and give us detailed information about your access problem. Our support team will review your request and contact you with further instructions.",
};
LongContent.parameters = {
  docs: {
    description: {
      story:
        "Modal dialog with longer content to demonstrate text wrapping and scrolling behavior.",
    },
  },
};
