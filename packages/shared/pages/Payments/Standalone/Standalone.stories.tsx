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

import type { Meta, StoryObj } from "@storybook/react";
import { StandalonePage } from "./index";
import { IPaymentsProps } from "./Standalone.types";

const meta: Meta<typeof StandalonePage> = {
  title: "Pages/Payments/StandalonePage",
  component: StandalonePage,
  parameters: {
    docs: {
      description: {
        component: "Standalone payments page component for DocSpace",
      },
    },
  },
  argTypes: {
    setPaymentsLicense: {
      control: { disable: true },
      table: { disable: true },
    },
    acceptPaymentsLicense: {
      control: { disable: true },
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StandalonePage>;

const defaultArgs: IPaymentsProps = {
  isTrial: false,
  setPaymentsLicense: () => {},
  acceptPaymentsLicense: () => {},
  isLicenseCorrect: false,
  salesEmail: "sales@example.com",
  isLicenseDateExpired: false,
  isDeveloper: false,
  buyUrl: "",
  trialDaysLeft: 30,
  paymentDate: "2025-12-31",
  isEnterprise: true,
  logoText: "DocSpace",
  openOnNewPage: false,
  licenseQuota: {
    userQuota: {},
    license: {
      branding: false,
      customization: false,
      timeLimited: false,
      end_date: "2025-06-11",
      trial: false,
      customer_id: "1",
      resource_key: "1",
      users_count: 10,
      users_expire: 30,
      connections: 10,
      docspace_dev: false,
    },
  },
  docspaceFaqUrl: "",
};

export const Enterprise: Story = {
  args: {
    ...defaultArgs,
    isTrial: false,
    isEnterprise: true,
  },
};

export const Trial: Story = {
  args: {
    ...defaultArgs,
    isTrial: true,
    isEnterprise: false,
    trialDaysLeft: 14,
  },
};

export const ExpiredLicense: Story = {
  args: {
    ...defaultArgs,
    isLicenseDateExpired: true,
  },
};

export const Developer: Story = {
  args: {
    ...defaultArgs,
    isDeveloper: true,
  },
};
