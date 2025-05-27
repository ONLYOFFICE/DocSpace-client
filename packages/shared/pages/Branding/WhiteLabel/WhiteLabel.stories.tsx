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

import { Meta, StoryObj } from "@storybook/react";

import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";

import { WhiteLabel } from ".";
import { mockLogos } from "./mockData";

const meta = {
  title: "Pages/Branding/WhiteLabel",
  component: WhiteLabel,
  parameters: {
    docs: {
      description: {
        component: "Settings for customizing logos and white label branding.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof WhiteLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isSettingPaid: true,
    logoUrls: mockLogos,
    showAbout: true,
    showNotAvailable: false,
    standalone: false,
    onSave: (data) => console.log("Save clicked with data:", data),
    onRestoreDefault: () => console.log("Restore default clicked"),
    isSaving: false,
    enableRestoreButton: true,
    setLogoUrls: (logoUrls) => console.log("Logo URLs updated:", logoUrls),
    isWhiteLabelLoaded: true,
    defaultWhiteLabelLogoUrls: mockLogos,
  },
};

export const Paid: Story = {
  args: {
    ...Default.args,
    isSettingPaid: false,
  },
};

export const NotAvailable: Story = {
  args: {
    ...Default.args,
    showNotAvailable: true,
  },
};
