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

import { createGetRoomsHandler } from "../../../__mocks__/storybook/handlers/files/rooms";
import {
  createGetFolderHandler,
  createGetFolderInfoHandler,
} from "../../../__mocks__/storybook/handlers/files/folders";
import { createGetFolderTreeHandler } from "../../../__mocks__/storybook/handlers/files/foldersTree";

import ManualBackup from "./index";
import {
  selectedStorages,
  storageRegions,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  useMockSelectedThirdPartyAccountProps,
  useMockFormSettingsProps,
} from "../mockData";
import type { ManualBackupProps } from "./ManualBackup.types";
import { DOCUMENTS } from "./ManualBackup.constants";
import { createStartBackupHandler } from "../../../__mocks__/storybook/handlers/portal/backup";

const ManualBackupWithState = (props: ManualBackupProps) => {
  const selectedThirdPartyAccountProps =
    useMockSelectedThirdPartyAccountProps();
  const mockFormSettingsProps = useMockFormSettingsProps();

  return (
    <ManualBackup
      {...props}
      {...selectedThirdPartyAccountProps}
      {...mockFormSettingsProps}
    />
  );
};

const meta: Meta<typeof ManualBackup> = {
  title: "Pages/Backup/ManualBackup",
  component: ManualBackupWithState,
  parameters: {
    docs: {
      description: {
        component: "Manual backup page component for DocSpace",
      },
    },
    msw: {
      handlers: [
        createGetFolderTreeHandler(),
        createGetRoomsHandler(),
        createGetFolderInfoHandler(),
        createGetFolderHandler(true),
        createStartBackupHandler(),
      ],
    },
  },
  argTypes: {
    buttonSize: { table: { disable: true } },
    isNeedFilePath: { table: { disable: true } },
    settingsFileSelector: { table: { disable: true } },
    defaultRegion: { table: { disable: true } },
    accounts: { table: { disable: true } },
    storageRegions: { table: { disable: true } },
    formSettings: { table: { disable: true } },
    thirdPartyStorage: { table: { disable: true } },
    errorsFieldsBeforeSafe: { table: { disable: true } },
    selectedThirdPartyAccount: { table: { disable: true } },
    connectedThirdPartyAccount: { table: { disable: true } },
    setIsBackupProgressVisible: { table: { disable: true } },
    setBackupProgressError: { table: { disable: true } },
    isFormReady: { table: { disable: true } },
    clearLocalStorage: { table: { disable: true } },
    setErrorInformation: { table: { disable: true } },
    setTemporaryLink: { table: { disable: true } },
    deleteValueFormSetting: { table: { disable: true } },
    setRequiredFormSettings: { table: { disable: true } },
    setDownloadingProgress: { table: { disable: true } },
    setIsThirdStorageChanged: { table: { disable: true } },
    setThirdPartyAccountsInfo: { table: { disable: true } },
    addValueInFormSettings: { table: { disable: true } },
    setSelectedThirdPartyAccount: { table: { disable: true } },
    getStorageParams: { table: { disable: true } },
    saveToLocalStorage: { table: { disable: true } },
    setConnectedThirdPartyAccount: { table: { disable: true } },
    setCompletedFormFields: { table: { disable: true } },
    basePath: { table: { disable: true } },
    isErrorPath: { table: { disable: true } },
    toDefault: { table: { disable: true } },
    setBasePath: { table: { disable: true } },
    setNewPath: { table: { disable: true } },
    dataBackupUrl: { table: { disable: true } },
    pageIsDisabled: { table: { disable: true } },
    currentDeviceType: { table: { disable: true } },
    currentColorScheme: { table: { disable: true } },
    setConnectDialogVisible: { table: { disable: true } },
    setDeleteThirdPartyDialogVisible: { table: { disable: true } },
    isNotPaidPeriod: { table: { disable: true } },
    removeItem: { table: { disable: true } },
    providers: { table: { disable: true } },
    deleteThirdParty: { table: { disable: true } },
    setThirdPartyProviders: { table: { disable: true } },
    openConnectWindow: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof ManualBackupWithState>;

export const Default: Story = {
  args: {
    isInitialLoading: false,
    isEmptyContentBeforeLoader: false,
    isNeedFilePath: false,
    settingsFileSelector: {
      getIcon: () => "",
    },
    defaultRegion: "us-east-1",
    downloadingProgress: 100,
    temporaryLink: null,
    accounts: mockThirdPartyAccounts,
    isBackupProgressVisible: false,
    isTheSameThirdPartyAccount: false,
    storageRegions,
    formSettings: {
      storageType: DOCUMENTS,
    },
    thirdPartyStorage: [
      selectedStorages.amazon,
      selectedStorages.googleCloud,
      selectedStorages.rackspace,
      selectedStorages.selectel,
    ],
    errorsFieldsBeforeSafe: {},
    connectedThirdPartyAccount: {
      id: "amazon-123",
      title: "Amazon S3",
      providerId: "amazon",
      providerKey: "amazon",
    },
    errorInformation: "",
    backupProgressError: "",
    setIsBackupProgressVisible: () => {},
    setBackupProgressError: () => {},
    isFormReady: () => true,
    clearLocalStorage: () => {},
    setErrorInformation: () => {},
    setTemporaryLink: () => {},
    deleteValueFormSetting: () => {},
    setRequiredFormSettings: () => {},
    setDownloadingProgress: () => {},
    setIsThirdStorageChanged: () => {},
    setThirdPartyAccountsInfo: async () => {},
    addValueInFormSettings: () => {},
    getStorageParams: () => [],
    saveToLocalStorage: () => {},
    setConnectedThirdPartyAccount: () => {},
    setCompletedFormFields: () => {},
    newPath: "/",
    basePath: "/",
    isErrorPath: false,
    toDefault: () => {},
    setBasePath: () => {},
    setNewPath: () => {},
    dataBackupUrl: "",
    pageIsDisabled: false,
    isNotPaidPeriod: false,
    connectDialogVisible: false,
    deleteThirdPartyDialogVisible: false,
    setConnectDialogVisible: () => {},
    setDeleteThirdPartyDialogVisible: () => {},
    removeItem: mockThirdPartyAccounts[0],
    providers: mockThirdPartyProviders,
    deleteThirdParty: async () => {},
    setThirdPartyProviders: () => {},
    openConnectWindow: async () => null,
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

export const Loading: Story = {
  args: {
    ...Default.args,
    isInitialLoading: true,
  },
};
