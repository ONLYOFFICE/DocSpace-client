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
import { AutoBackupPeriod } from "@docspace/shared/enums";

import GoogleCloudStorage from "./GoogleCloudStorage";
import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
  selectedStorages,
} from "../../../mockData";

const meta = {
  title: "Pages/AutoBackup/Storages/GoogleCloudStorage",
  component: GoogleCloudStorage,
  parameters: {
    docs: {
      description: {
        component: "Google Cloud storage configuration for Auto Backup",
      },
    },
  },
  args: {
    isLoading: false,
    isLoadingData: false,
    isNeedFilePath: false,
    formSettings: {
      bucket: "my-gcloud-bucket",
      serviceAccount: "service-account@project-id.iam.gserviceaccount.com",
      filePath: "backups/",
    },
    errorsFieldsBeforeSafe: {},
    selectedStorage: selectedStorages.googleCloud,

    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    selectedHour: "12:00",
    selectedMonthDay: "1",
    selectedMaxCopiesNumber: "3",
    selectedPeriodNumber: AutoBackupPeriod.EveryDayType.toString(),
    periodsObject,
    weekdaysLabelArray,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,

    setCompletedFormFields: action("setCompletedFormFields"),
    addValueInFormSettings: action("addValueInFormSettings"),
    setRequiredFormSettings: action("setRequiredFormSettings"),
    setIsThirdStorageChanged: action("setIsThirdStorageChanged"),
    setMaxCopies: action("setMaxCopies"),
    setPeriod: action("setPeriod"),
    setWeekday: action("setWeekday"),
    setMonthNumber: action("setMonthNumber"),
    setTime: action("setTime"),
  },
} satisfies Meta<typeof GoogleCloudStorage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
