// (c) Copyright Ascensio System SIA 2009-2025
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
import { Bonus } from "./index";

const meta: Meta<typeof Bonus> = {
  title: "Pages/Payments/Bonus",
  component: Bonus,
  parameters: {
    docs: {
      description: {
        component:
          "Bonus component for payments page showing enterprise benefits and contact information",
      },
    },
  },
  argTypes: {
    isEnterprise: { control: "boolean" },
    isTrial: { control: "boolean" },
    isDeveloper: { control: "boolean" },
    isCommunity: { control: "boolean" },
    salesEmail: { control: "text" },
    dataBackupUrl: { control: "text" },
    logoText: { control: "text" },
    enterpriseInstallScriptUrl: { control: "text" },
    enterpriseInstallWindowsUrl: { control: "text" },
    forEnterprisesUrl: { control: "text" },
    demoOrderUrl: { control: "text" },
    feedbackAndSupportUrl: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Bonus>;

export const Default: Story = {
  args: {
    isEnterprise: false,
    isTrial: false,
    isDeveloper: false,
    isCommunity: false,
    salesEmail: "sales@example.com",
    dataBackupUrl: "",
    logoText: "DocSpace",
    enterpriseInstallScriptUrl: "",
    enterpriseInstallWindowsUrl: "",
    forEnterprisesUrl: "",
    demoOrderUrl: "",
    feedbackAndSupportUrl: "",
  },
};

export const Enterprise: Story = {
  args: {
    ...Default.args,
    isEnterprise: true,
  },
};

export const Trial: Story = {
  args: {
    ...Default.args,
    isEnterprise: true,
    isTrial: true,
  },
};

export const Developer: Story = {
  args: {
    ...Default.args,
    isEnterprise: true,
    isDeveloper: true,
  },
};

export const Community: Story = {
  args: {
    ...Default.args,
    isCommunity: true,
  },
};
