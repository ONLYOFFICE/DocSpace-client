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

import { useState } from "react";

import { AutoBackupPeriod, ThirdPartyStorages } from "../../enums";
import type { TOption } from "../../components/combobox";
import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  ThirdPartyAccountType,
} from "../../types";

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
    id: ThirdPartyStorages.AmazonId,
    isSet: true,
    title: "Amazon S3",
    properties: [
      { name: "accessKey", title: "Access Key", value: "test-key" },
      { name: "secretKey", title: "Secret Key", value: "test-secret" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
    ],
    formSettings: {
      accessKey: "test-key",
      secretKey: "test-secret",
      bucket: "test-bucket",
    },
    defaultRegion: "us-east-1",
  },

  googleCloud: {
    id: ThirdPartyStorages.GoogleId,
    isSet: true,
    title: "Google Cloud",
    properties: [
      { name: "projectId", title: "Project ID", value: "test-project" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
      { name: "clientEmail", title: "Client Email", value: "test@example.com" },
    ],
    formSettings: {
      projectId: "test-project",
      bucket: "test-bucket",
      clientEmail: "test@example.com",
    },
  },

  rackspace: {
    id: ThirdPartyStorages.RackspaceId,
    isSet: true,
    title: "Rackspace",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "apiKey", title: "API Key", value: "test-api-key" },
      { name: "container", title: "Container", value: "test-container" },
    ],
    formSettings: {
      username: "test-username",
      apiKey: "test-api-key",
      container: "test-container",
    },
  },

  selectel: {
    id: ThirdPartyStorages.SelectelId,
    isSet: true,
    title: "Selectel",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "password", title: "Password", value: "test-password" },
      { name: "container", title: "Container", value: "test-container" },
    ],
    formSettings: {
      username: "test-username",
      password: "test-password",
      container: "test-container",
    },
  },

  emptyAmazon: {
    id: ThirdPartyStorages.AmazonId,
    isSet: false,
    title: "Amazon S3",
    properties: [
      { name: "accessKey", title: "Access Key", value: "test-key" },
      { name: "secretKey", title: "Secret Key", value: "test-secret" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
    ],
    formSettings: {
      accessKey: "test-key",
      secretKey: "test-secret",
      bucket: "test-bucket",
    },
  },

  emptyGoogleCloud: {
    id: ThirdPartyStorages.GoogleId,
    isSet: false,
    title: "Google Cloud",
    properties: [
      { name: "projectId", title: "Project ID", value: "test-project" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
      { name: "clientEmail", title: "Client Email", value: "test@example.com" },
    ],
    formSettings: {
      projectId: "test-project",
      bucket: "test-bucket",
      clientEmail: "test@example.com",
    },
  },

  emptyRackspace: {
    id: ThirdPartyStorages.RackspaceId,
    isSet: false,
    title: "Rackspace",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "apiKey", title: "API Key", value: "test-api-key" },
      { name: "container", title: "Container", value: "test-container" },
    ],
    formSettings: {
      username: "test-username",
      apiKey: "test-api-key",
      container: "test-container",
    },
  },

  emptySelectel: {
    id: ThirdPartyStorages.SelectelId,
    isSet: false,
    title: "Selectel",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "password", title: "Password", value: "test-password" },
      { name: "container", title: "Container", value: "test-container" },
    ],
    formSettings: {
      username: "test-username",
      password: "test-password",
      container: "test-container",
    },
  },
};

export const mockConnectedAccount: ConnectedThirdPartyAccountType = {
  id: "dropbox-123",
  title: "Dropbox",
  providerId: "dropbox",
  providerKey: "dropbox",
};

export const mockThirdPartyProviders = [
  {
    corporate: false,
    roomsStorage: false,
    customerTitle: "Google Drive",
    providerId: "google",
    providerKey: "google",
    provider_id: "google",
    customer_title: "Google Drive",
  },
  {
    corporate: false,
    roomsStorage: false,
    customerTitle: "Dropbox",
    providerId: "dropbox",
    providerKey: "dropbox",
    provider_id: "dropbox",
    customer_title: "Dropbox",
  },
];

export const mockThirdPartyAccounts = [
  {
    key: ThirdPartyStorages.AmazonId,
    provider_key: ThirdPartyStorages.AmazonId,
    name: ThirdPartyStorages.AmazonId,
    label: "Amazon S3",
    title: "Amazon S3",
    storageIsConnected: false,
    disabled: false,
    connected: true,
  },
  {
    key: ThirdPartyStorages.GoogleId,
    provider_key: ThirdPartyStorages.GoogleId,
    name: ThirdPartyStorages.GoogleId,
    label: "Google Cloud Storage",
    title: "Google Cloud Storage",
    storageIsConnected: false,
    disabled: false,
    connected: true,
  },
  {
    key: ThirdPartyStorages.RackspaceId,
    provider_key: ThirdPartyStorages.RackspaceId,
    name: ThirdPartyStorages.RackspaceId,
    label: "Rackspace Cloud Files",
    title: "Rackspace Cloud Files",
    storageIsConnected: false,
    disabled: false,
    connected: false,
  },
  {
    key: ThirdPartyStorages.SelectelId,
    provider_key: ThirdPartyStorages.SelectelId,
    name: ThirdPartyStorages.SelectelId,
    label: "Selectel Storage",
    title: "Selectel Storage",
    storageIsConnected: false,
    disabled: false,
    connected: false,
  },
];

export const useMockScheduleProps = () => {
  const [selectedEnableSchedule, setSelectedEnableSchedule] = useState(true);
  const [selectedWeekdayLabel, setSelectedWeekdayLabel] = useState("Monday");
  const [selectedMonthDay, setSelectedMonthDay] = useState("1");
  const [selectedHour, setSelectedHour] = useState("0:00");
  const [selectedMaxCopiesNumber, setSelectedMaxCopiesNumber] = useState("3");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState("Every day");
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState("0");

  const handleWeekdayChange = (option: TOption) => {
    setSelectedWeekdayLabel(option?.label || selectedWeekdayLabel);
  };

  const handleTimeChange = (option: TOption) => {
    setSelectedHour(option?.label || selectedHour);
  };

  const handleMaxCopiesChange = (option: TOption) => {
    setSelectedMaxCopiesNumber(
      option?.key.toString() || selectedMaxCopiesNumber,
    );
  };

  const handlePeriodChange = (option: TOption) => {
    setSelectedPeriodLabel(option?.label || selectedPeriodLabel);
    setSelectedPeriodNumber(option?.key.toString() || selectedPeriodNumber);
  };

  const handleMonthNumberChange = (option: TOption) => {
    setSelectedMonthDay(option?.label || selectedMonthDay);
  };

  const handleToggle = () => {
    setSelectedEnableSchedule(!selectedEnableSchedule);
  };

  return {
    selectedEnableSchedule,
    setSelectedEnableSchedule: handleToggle,
    selectedPeriodNumber,
    selectedPeriodLabel,
    setPeriod: handlePeriodChange,
    selectedHour,
    setTime: handleTimeChange,
    selectedWeekdayLabel,
    setWeekday: handleWeekdayChange,
    selectedMonthDay,
    setMonthNumber: handleMonthNumberChange,
    selectedMaxCopiesNumber,
    setMaxCopies: handleMaxCopiesChange,
  };
};

export const useMockFormSettingsProps = () => {
  const [formSettings, setFormSettings] = useState<Record<string, string>>({});

  const addValueInFormSettings = (name: string, value: string) => {
    setFormSettings((prevState) => ({ ...prevState, [name]: value }));
  };

  const deleteValueFormSetting = (key: string) => {
    setFormSettings((prevState) => {
      const newObj = { ...prevState };
      delete newObj[key];

      return newObj;
    });
  };

  return {
    formSettings,
    addValueInFormSettings,
    deleteValueFormSetting,
  };
};

export const useMockStorageIdProps = () => {
  const [storageId, setStorageId] = useState<Nullable<string>>(
    ThirdPartyStorages.AmazonId,
  );

  return {
    setStorageId: (id: Nullable<string>) => setStorageId(id),
    selectedStorageId: storageId,
  };
};

export const useMockSelectedThirdPartyAccountProps = () => {
  const [selectedThirdPartyAccount, setSelectedThirdPartyAccount] =
    useState<ThirdPartyAccountType>(mockThirdPartyAccounts[0]);

  const handleSelectedThirdPartyAccountChange = (
    account: Nullable<Partial<ThirdPartyAccountType>>,
  ) => {
    if (!account) return;

    setSelectedThirdPartyAccount(
      (account as Nullable<ThirdPartyAccountType>) || mockThirdPartyAccounts[0],
    );
  };
  return {
    selectedThirdPartyAccount,
    setSelectedThirdPartyAccount: handleSelectedThirdPartyAccountChange,
  };
};
