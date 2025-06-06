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
import { http, HttpResponse } from "msw";

import { BackupStorageType, DeviceType } from "@docspace/shared/enums";

import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
} from "../../mockData";
import styles from "../../../Backup.module.scss";
import { RoomsModule } from ".";

const meta = {
  title: "Pages/Backup/AutoBackup/RoomsModule",
  component: RoomsModule,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Room selection and configuration module for Auto Backup",
      },
    },
    msw: {
      handlers: [http.get("*/api/2.0/*", () => new HttpResponse(null))],
    },
  },
  argTypes: {
    isError: {
      control: "boolean",
      description: "Whether there is an error in the module",
    },
    isLoadingData: {
      control: "boolean",
      description: "Whether data is being loaded",
    },
  },
  args: {
    // Basic props
    isError: false,
    isLoadingData: false,
    setIsError: action("setIsError"),

    // FilesSelectorInput props
    basePath: "/",
    newPath: "/",
    toDefault: action("toDefault"),
    isErrorPath: false,
    setBasePath: action("setBasePath"),
    setNewPath: action("setNewPath"),
    settingsFileSelector: {
      getIcon: () => {},
    },
    currentDeviceType: DeviceType.desktop,

    // Backup store props
    defaultStorageType: BackupStorageType.DocumentModuleType.toString(),
    setSelectedFolder: action("setSelectedFolder"),
    defaultFolderId: "folder-123",

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
  decorators: [
    (Story) => (
      <div className={styles.autoBackup}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoomsModule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultStorageType: BackupStorageType.DocumentModuleType.toString(),
    defaultFolderId: "folder-123",
    isError: false,
    isLoadingData: false,
    currentDeviceType: DeviceType.desktop,
  },
};

export const WithError: Story = {
  args: {
    defaultStorageType: BackupStorageType.DocumentModuleType.toString(),
    defaultFolderId: "folder-123",
    isError: true,
    isLoadingData: false,
    currentDeviceType: DeviceType.desktop,
  },
};

export const Loading: Story = {
  args: {
    defaultStorageType: BackupStorageType.DocumentModuleType.toString(),
    defaultFolderId: "folder-123",
    isError: false,
    isLoadingData: true,
    currentDeviceType: DeviceType.desktop,
  },
};
