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

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ThirdPartyStorages } from "../../../enums";

import { createGetRoomsHandler } from "../../../__mocks__/storybook/handlers/files/rooms";
import {
  createGetFolderHandler,
  createGetFolderInfoHandler,
} from "../../../__mocks__/storybook/handlers/files/folders";
import { createGetFolderTreeHandler } from "../../../__mocks__/storybook/handlers/files/foldersTree";
import type { Nullable } from "../../../types";

import AutomaticBackup from "./index";
import {
  selectedStorages,
  storageRegions,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  useMockScheduleProps,
  useMockFormSettingsProps,
  useMockStorageIdProps,
  useMockSelectedThirdPartyAccountProps,
} from "../mockData";
import type { AutomaticBackupProps } from "./AutoBackup.types";

const AutoBackupWithToggle = ({
  selectedEnableSchedule,
  selectedStorageType,
  ...rest
}: AutomaticBackupProps) => {
  const [storageType, setStorageType] = useState(selectedStorageType);

  const scheduleProps = useMockScheduleProps();
  const formSettingsProps = useMockFormSettingsProps();
  const storageIdProps = useMockStorageIdProps();
  const selectedThirdPartyAccountProps =
    useMockSelectedThirdPartyAccountProps();

  const handleStorageTypeChange = (type: Nullable<string>) => {
    setStorageType(type);
  };

  return (
    <AutomaticBackup
      {...rest}
      selectedStorageType={storageType}
      seStorageType={handleStorageTypeChange}
      {...scheduleProps}
      {...formSettingsProps}
      {...storageIdProps}
      {...selectedThirdPartyAccountProps}
    />
  );
};

const meta: Meta<typeof AutomaticBackup> = {
  title: "Pages/Backup/AutoBackup",
  component: AutoBackupWithToggle,
  parameters: {
    docs: {
      description: {
        component: "Automatic backup page component for DocSpace",
      },
    },
    msw: {
      handlers: [
        createGetFolderTreeHandler(),
        createGetRoomsHandler(),
        createGetFolderInfoHandler(),
        createGetFolderHandler(true),
      ],
    },
  },
  argTypes: {
    language: { table: { disable: true } },
    setDefaultOptions: { table: { disable: true } },
    setThirdPartyStorage: { table: { disable: true } },
    setBackupSchedule: { table: { disable: true } },
    setConnectedThirdPartyAccount: { table: { disable: true } },
    seStorageType: { table: { disable: true } },
    setSelectedEnableSchedule: { table: { disable: true } },
    toDefault: { table: { disable: true } },
    resetNewFolderPath: { table: { disable: true } },
    updateBaseFolderPath: { table: { disable: true } },
    isFormReady: { table: { disable: true } },
    getStorageParams: { table: { disable: true } },
    deleteSchedule: { table: { disable: true } },
    setIsBackupProgressVisible: { table: { disable: true } },
    setSelectedFolder: { table: { disable: true } },
    toDefaultFileSelector: { table: { disable: true } },
    setBasePath: { table: { disable: true } },
    setNewPath: { table: { disable: true } },
    openConnectWindow: { table: { disable: true } },
    setConnectDialogVisible: { table: { disable: true } },
    setDeleteThirdPartyDialogVisible: { table: { disable: true } },
    setMaxCopies: { table: { disable: true } },
    setMonthNumber: { table: { disable: true } },
    setPeriod: { table: { disable: true } },
    setTime: { table: { disable: true } },
    setWeekday: { table: { disable: true } },
    setStorageId: { table: { disable: true } },
    setCompletedFormFields: { table: { disable: true } },
    addValueInFormSettings: { table: { disable: true } },
    setIsThirdStorageChanged: { table: { disable: true } },
    setRequiredFormSettings: { table: { disable: true } },
    deleteValueFormSetting: { table: { disable: true } },
    clearLocalStorage: { table: { disable: true } },
    setSelectedThirdPartyAccount: { table: { disable: true } },
    setThirdPartyAccountsInfo: { table: { disable: true } },
    deleteThirdParty: { table: { disable: true } },
    setThirdPartyProviders: { table: { disable: true } },
    setDownloadingProgress: { table: { disable: true } },
    setTemporaryLink: { table: { disable: true } },
    setErrorInformation: { table: { disable: true } },
    setBackupProgressError: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof AutoBackupWithToggle>;

export const Default: Story = {
  args: {
    language: "en",
    removeItem: mockThirdPartyAccounts[0],
    isEnableAuto: true,
    settingsFileSelector: {
      getIcon: () => "",
    },
    isInitialLoading: false,
    isEmptyContentBeforeLoader: false,
    isInitialError: false,
    errorInformation: "",
    isBackupProgressVisible: false,
    downloadingProgress: 0,
    formSettings: {},
    errorsFieldsBeforeSafe: {},
    thirdPartyStorage: [
      selectedStorages.amazon,
      selectedStorages.googleCloud,
      selectedStorages.rackspace,
      selectedStorages.selectel,
    ],
    storageRegions,
    defaultRegion: "us-east-1",
    accounts: mockThirdPartyAccounts,
    isTheSameThirdPartyAccount: false,
    selectedThirdPartyAccount: mockThirdPartyAccounts[0],
    connectedThirdPartyAccount: {
      id: "amazon-123",
      title: "Amazon S3",
      providerId: "amazon",
      providerKey: "amazon",
    },
    selectedStorageType: "0",
    selectedFolderId: "1",
    selectedMaxCopiesNumber: "3",
    selectedPeriodNumber: "0",
    selectedWeekday: "0",
    selectedHour: "0:00",
    selectedMonthDay: "1",
    selectedStorageId: ThirdPartyStorages.AmazonId,
    selectedEnableSchedule: true,
    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    isChanged: false,
    isThirdStorageChanged: false,
    defaultStorageType: "0",
    defaultFolderId: "1",
    defaultStorageId: ThirdPartyStorages.AmazonId,
    basePath: "/",
    newPath: "/",
    isErrorPath: false,
    providers: mockThirdPartyProviders,
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    backupProgressError: "",

    setDefaultOptions: () => {},
    setThirdPartyStorage: () => {},
    setBackupSchedule: () => {},
    setConnectedThirdPartyAccount: () => {},
    toDefault: () => {},
    resetNewFolderPath: () => {},
    updateBaseFolderPath: () => {},
    isFormReady: () => true,
    getStorageParams: () => [],
    deleteSchedule: () => {},
    setIsBackupProgressVisible: () => {},
    setSelectedFolder: () => {},
    toDefaultFileSelector: () => {},
    setBasePath: () => {},
    setNewPath: () => {},
    openConnectWindow: async () => null,
    setConnectDialogVisible: () => {},
    setDeleteThirdPartyDialogVisible: () => {},
    setMaxCopies: () => {},
    setMonthNumber: () => {},
    setPeriod: () => {},
    setTime: () => {},
    setWeekday: () => {},
    setStorageId: () => {},
    setCompletedFormFields: () => {},
    addValueInFormSettings: () => {},
    setIsThirdStorageChanged: () => {},
    setRequiredFormSettings: () => {},
    deleteValueFormSetting: () => {},
    clearLocalStorage: () => {},
    setSelectedThirdPartyAccount: () => {},
    setThirdPartyAccountsInfo: async () => {},
    deleteThirdParty: async () => {},
    setThirdPartyProviders: () => {},
    setDownloadingProgress: () => {},
    setTemporaryLink: () => {},
    setErrorInformation: () => {},
    setBackupProgressError: () => {},
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    errorInformation: "Error occurred during backup configuration",
  },
};

export const WithProgress: Story = {
  args: {
    ...Default.args,
    isBackupProgressVisible: true,
    downloadingProgress: 50,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isEnableAuto: false,
    selectedEnableSchedule: false,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isInitialLoading: true,
  },
};
