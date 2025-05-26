/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import PublicRoomPassword from "./index";
import type { TPublicRoomPassword } from "../../../api/rooms/types";
import type { TTranslation } from "../../../types";

const mockT: TTranslation = (key: string) => {
  const translations: Record<string, string> = {
    "Common:EnterPassword": "Enter password",
    "Common:NeedPassword": "You need a password to access",
    "Common:Password": "Password",
    "Common:ContinueButton": "Continue",
    "Common:RequiredField": "This field is required",
    "Common:IncorrectPassword": "Incorrect password",
  };

  return translations[key] || key;
};

const meta = {
  title: "Pages/PublicRoom/PublicRoomPasswordForm",
  component: PublicRoomPassword,
  parameters: {
    docs: {
      description: {
        component: "Form for entering password to access a public room",
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
    t: { table: { disable: true } },
    roomKey: { control: "text" },
    roomTitle: { control: "text" },
    onSuccessValidationCallback: { action: "onSuccessValidation" },
  },
  decorators: [
    (Story, context) => {
      const isDocs = context.viewMode === "docs";

      return (
        <div style={{ height: isDocs ? "auto" : "100vh" }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof PublicRoomPassword>;

type Story = StoryObj<typeof PublicRoomPassword>;
export default meta;

export const Default: Story = {
  args: {
    t: mockT,
    roomKey: "sample-room-key",
    roomTitle: "Sample Public Room",
    onSuccessValidationCallback: (res: TPublicRoomPassword) =>
      console.log("Success validation", res),
  },
};
