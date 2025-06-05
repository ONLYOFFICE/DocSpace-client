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

import { AutoBackupPeriod } from "@docspace/shared/enums";
import type { TOption } from "@docspace/shared/components/combobox";
import type { SelectedStorageType } from "@docspace/shared/types";

export const periodsObject: TOption[] = [
  { key: AutoBackupPeriod.EveryDayType, label: "Every day" },
  { key: AutoBackupPeriod.EveryWeekType, label: "Every week" },
  { key: AutoBackupPeriod.EveryMonthType, label: "Every month" },
];

export const weekdaysLabelArray: TOption[] = [
  { key: 0, label: "Monday" },
  { key: 1, label: "Tuesday" },
  { key: 2, label: "Wednesday" },
  { key: 3, label: "Thursday" },
  { key: 4, label: "Friday" },
  { key: 5, label: "Saturday" },
  { key: 6, label: "Sunday" },
];

export const monthNumbersArray: TOption[] = Array(31)
  .fill(null)
  .map((_, index) => ({
    key: index + 1,
    label: `${index + 1}`,
  }));

export const hoursArray: TOption[] = Array(24)
  .fill(null)
  .map((_, index) => ({
    key: index,
    label: `${index}:00`,
  }));

export const maxNumberCopiesArray: TOption[] = [
  { key: 1, label: "Max 1 copy" },
  { key: 2, label: "Max 2 copies" },
  { key: 3, label: "Max 3 copies" },
  { key: 5, label: "Max 5 copies" },
  { key: 10, label: "Max 10 copies" },
];

export const storageRegions = [
  {
    systemName: "us-east-1",
    displayName: "US East (N. Virginia)",
  },
  {
    systemName: "us-west-1",
    displayName: "US West (N. California)",
  },
  {
    systemName: "eu-west-1",
    displayName: "EU (Ireland)",
  },
  {
    systemName: "ap-northeast-1",
    displayName: "Asia Pacific (Tokyo)",
  },
];

export const selectedStorages = {
  amazon: {
    id: "amazon",
    isSet: true,
    title: "Amazon S3",
    properties: [
      { title: "Bucket", value: "my-backup-bucket" },
      { title: "Access Key", value: "AKIAIOSFODNN7EXAMPLE" },
      { title: "Region", value: "US East (N. Virginia)" },
    ],
  } as SelectedStorageType,

  googleCloud: {
    id: "googlecloud",
    isSet: true,
    title: "Google Cloud",
    properties: [
      { title: "Bucket", value: "my-gcloud-bucket" },
      {
        title: "Service Account",
        value: "service-account@project-id.iam.gserviceaccount.com",
      },
    ],
  } as SelectedStorageType,

  rackspace: {
    id: "rackspace",
    isSet: true,
    title: "Rackspace",
    properties: [
      { title: "Private Container", value: "my-private-container" },
      { title: "Public Container", value: "my-public-container" },
      { title: "Region", value: "US" },
    ],
  } as SelectedStorageType,

  selectel: {
    id: "selectel",
    isSet: true,
    title: "Selectel",
    properties: [
      { title: "Container", value: "my-selectel-container" },
      { title: "Username", value: "selectel-user" },
    ],
  } as SelectedStorageType,
};
