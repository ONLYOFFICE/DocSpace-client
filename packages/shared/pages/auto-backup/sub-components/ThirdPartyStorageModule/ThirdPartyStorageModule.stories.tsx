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
import { action } from "@storybook/addon-actions";
import { ThirdPartyStorages } from "@docspace/shared/enums";

import ThirdPartyStorageModule from "./ThirdPartyStorageModule";
import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
  selectedStorages,
} from "../../mockData";

const meta = {
  title: "Pages/AutoBackup/ThirdPartyStorageModule",
  component: ThirdPartyStorageModule,
  parameters: {
    docs: {
      description: {
        component:
          "Third-party storage selection and configuration module for Auto Backup",
      },
    },
  },
  argTypes: {
    defaultStorageId: {
      control: "select",
      options: [
        ThirdPartyStorages.AmazonId,
        ThirdPartyStorages.GoogleId,
        ThirdPartyStorages.RackspaceId,
        ThirdPartyStorages.SelectelId,
      ],
      description: "Default storage provider ID",
    },
    selectedStorageId: {
      control: "select",
      options: [
        ThirdPartyStorages.AmazonId,
        ThirdPartyStorages.GoogleId,
        ThirdPartyStorages.RackspaceId,
        ThirdPartyStorages.SelectelId,
      ],
      description: "Selected storage provider ID",
    },
  },
  args: {
    thirdPartyStorage: [
      selectedStorages.amazon,
      selectedStorages.googleCloud,
      selectedStorages.rackspace,
      selectedStorages.selectel,
    ],
    setStorageId: action("setStorageId"),
    defaultStorageId: ThirdPartyStorages.AmazonId,
    selectedStorageId: ThirdPartyStorages.AmazonId,
    isLoadingData: false,

    formSettings: {
      bucketName: "my-bucket",
      accessKey: "AKIAIOSFODNN7EXAMPLE",
      secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      filePath: "backups/",
    },
    errorsFieldsBeforeSafe: {},
    isNeedFilePath: true,

    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    selectedHour: "12:00",
    selectedMonthDay: "1",
    selectedMaxCopiesNumber: "3",
    selectedPeriodNumber: "0",

    periodsObject,
    weekdaysLabelArray,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,

    storageRegions: [
      { systemName: "us-east-1", displayName: "US East (N. Virginia)" },
      { systemName: "us-west-1", displayName: "US West (N. California)" },
      { systemName: "eu-west-1", displayName: "EU (Ireland)" },
      { systemName: "ap-northeast-1", displayName: "Asia Pacific (Tokyo)" },
    ],
    defaultRegion: "us-east-1",

    setCompletedFormFields: action("setCompletedFormFields"),
    addValueInFormSettings: action("addValueInFormSettings"),
    setRequiredFormSettings: action("setRequiredFormSettings"),
    setIsThirdStorageChanged: action("setIsThirdStorageChanged"),
    setMaxCopies: action("setMaxCopies"),
    setPeriod: action("setPeriod"),
    setWeekday: action("setWeekday"),
    setMonthNumber: action("setMonthNumber"),
    setTime: action("setTime"),
    deleteValueFormSetting: action("deleteValueFormSetting"),
  },
  tags: ["!autodocs"],
} satisfies Meta<typeof ThirdPartyStorageModule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AmazonSelected: Story = {
  args: {
    defaultStorageId: ThirdPartyStorages.AmazonId,
    selectedStorageId: ThirdPartyStorages.AmazonId,
    formSettings: {
      bucketName: "my-bucket",
      accessKey: "AKIAIOSFODNN7EXAMPLE",
      secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      filePath: "backups/",
    },
  },
};

export const GoogleCloudSelected: Story = {
  args: {
    defaultStorageId: ThirdPartyStorages.GoogleId,
    selectedStorageId: ThirdPartyStorages.GoogleId,
    formSettings: {
      projectId: "my-project",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nMIIE...sample...key==\n-----END PRIVATE KEY-----\n",
      clientEmail: "example@project-id.iam.gserviceaccount.com",
      bucketName: "my-google-bucket",
      filePath: "backups/",
    },
  },
};

export const RackspaceSelected: Story = {
  args: {
    defaultStorageId: ThirdPartyStorages.RackspaceId,
    selectedStorageId: ThirdPartyStorages.RackspaceId,
    formSettings: {
      privateContainer: "my-private-container",
      publicContainer: "my-public-container",
      region: "US",
      apiKey: "rackspace-api-key-example",
      filePath: "backups/",
    },
  },
};

export const SelectelSelected: Story = {
  args: {
    defaultStorageId: ThirdPartyStorages.SelectelId,
    selectedStorageId: ThirdPartyStorages.SelectelId,
    formSettings: {
      container: "my-selectel-container",
      username: "selectel-user",
      password: "selectel-password-example",
      filePath: "backups/",
    },
  },
};
