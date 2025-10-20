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

import { CompanyInfo } from ".";

const meta = {
  title: "Pages/Branding/CompanyInfo",
  component: CompanyInfo,
  parameters: {
    docs: {
      description: {
        component: "Settings for customizing company information.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof CompanyInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultCompanySettings = {
  address: "123 Example Street, Sample City, Country, 12345",
  companyName: "Example Company Ltd.",
  email: "info@example.com",
  phone: "+1 234 567 8900",
  site: "www.example.com",
  isDefault: true,
  isLicensor: true,
  hideAbout: true,
};

const defaultBuildInfo = {
  docSpace: "7.0.0",
  communityServer: "7.0.0",
  documentServer: "7.0.0",
};

export const Default: Story = {
  args: {
    displayAbout: false,
    isBrandingAvailable: true,
    isSettingPaid: true,
    companySettings: defaultCompanySettings,
    onSave: (address, companyName, email, phone, site) =>
      console.log("Save clicked with data:", {
        address,
        companyName,
        email,
        phone,
        site,
      }),
    onRestore: () => console.log("Restore clicked"),
    isLoading: false,
    companyInfoSettingsIsDefault: true,
    buildVersionInfo: defaultBuildInfo,
    standalone: false,
    licenseAgreementsUrl: "https://www.example.com/license-agreement",
    isEnterprise: false,
    logoText: "Example DocSpace",
  },
};

export const Paid: Story = {
  args: {
    displayAbout: false,
    isBrandingAvailable: true,
    isSettingPaid: false,
    companySettings: defaultCompanySettings,
    onSave: (address, companyName, email, phone, site) =>
      console.log("Save clicked with data:", {
        address,
        companyName,
        email,
        phone,
        site,
      }),
    onRestore: () => console.log("Restore clicked"),
    isLoading: false,
    companyInfoSettingsIsDefault: true,
    buildVersionInfo: defaultBuildInfo,
    standalone: false,
    licenseAgreementsUrl: "https://www.example.com/license-agreement",
    isEnterprise: false,
    logoText: "Example DocSpace",
  },
};
