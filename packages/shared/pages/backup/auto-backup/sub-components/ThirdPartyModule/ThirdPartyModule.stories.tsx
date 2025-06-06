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

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { fn } from "@storybook/test";

import { BackupStorageType } from "@docspace/shared/enums";
import { ButtonSize } from "@docspace/shared/components/button";

import styles from "../../../Backup.module.scss";
import {
  hoursArray,
  maxNumberCopiesArray,
  monthNumbersArray,
  periodsObject,
  weekdaysLabelArray,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
} from "../../mockData";
import { ThirdPartyModule } from ".";

export default {
  title: "Pages/Backup/AutoBackup/ThirdPartyModule",
  component: ThirdPartyModule,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Third-party storage selection and configuration module for Auto Backup",
      },
    },
  },
  argTypes: {
    isError: {
      control: "boolean",
      description: "Whether an error occurred",
    },
    isLoadingData: {
      control: "boolean",
      description: "Whether data is currently loading",
    },
    defaultStorageType: {
      control: "text",
      description: "Default storage type",
    },
    defaultFolderId: {
      control: "text",
      description: "Default folder ID",
    },
  },
  decorators: [
    (Story) => (
      <div className={styles.autoBackup}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof ThirdPartyModule>;

type Story = StoryObj<typeof ThirdPartyModule>;

export const Default: Story = {
  args: {
    // Basic props
    isError: false,
    isLoadingData: false,
    defaultStorageType: BackupStorageType.ResourcesModuleType.toString(),
    defaultFolderId: "folder-123",
    setSelectedFolder: action("setSelectedFolder"),

    // DirectThirdPartyConnection props
    accounts: mockThirdPartyAccounts,
    basePath: "/",
    clearLocalStorage: action("clearLocalStorage"),
    connectDialogVisible: false,
    connectedThirdPartyAccount: null,
    deleteThirdParty: fn(),
    deleteThirdPartyDialogVisible: false,
    filesSelectorSettings: {
      getIcon: () => {},
    },
    isErrorPath: false,
    isTheSameThirdPartyAccount: false,
    newPath: "/",
    openConnectWindow: fn(),
    providers: mockThirdPartyProviders,
    removeItem: mockThirdPartyAccounts[0],
    selectedThirdPartyAccount: mockThirdPartyAccounts[0],
    setBasePath: action("setBasePath"),
    setConnectDialogVisible: action("setConnectDialogVisible"),
    setConnectedThirdPartyAccount: action("setConnectedThirdPartyAccount"),
    setDeleteThirdPartyDialogVisible: action(
      "setDeleteThirdPartyDialogVisible",
    ),
    setNewPath: action("setNewPath"),
    setSelectedThirdPartyAccount: action("setSelectedThirdPartyAccount"),
    setThirdPartyAccountsInfo: fn(),
    setThirdPartyProviders: action("setThirdPartyProviders"),
    toDefault: action("toDefault"),
    buttonSize: ButtonSize.small,

    // ScheduleComponent props
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
    setMaxCopies: action("setMaxCopies"),
    setPeriod: action("setPeriod"),
    setWeekday: action("setWeekday"),
    setMonthNumber: action("setMonthNumber"),
    setTime: action("setTime"),
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoadingData: true,
  },
};
