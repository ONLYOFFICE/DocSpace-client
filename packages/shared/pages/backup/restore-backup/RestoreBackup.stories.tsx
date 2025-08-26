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

import {
  createDeleteBackupHistoryHandler,
  createGetBackupHistoryHandler,
} from "../../../__mocks__/storybook/handlers/portal/backupHistory";
import { createDeleteBackupHandler } from "../../../__mocks__/storybook/handlers/portal/backup";
import { createStartRestoreHandler } from "../../../__mocks__/storybook/handlers/portal/restore";
import { createGetRoomsHandler } from "../../../__mocks__/storybook/handlers/files/rooms";
import {
  createGetFolderHandler,
  createGetFolderInfoHandler,
} from "../../../__mocks__/storybook/handlers/files/folders";
import { createGetFolderTreeHandler } from "../../../__mocks__/storybook/handlers/files/foldersTree";

import { RestoreBackup } from "./index";
import {
  selectedStorages,
  storageRegions,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
  useMockSelectedThirdPartyAccountProps,
  useMockStorageIdProps,
  useMockFormSettingsProps,
} from "../mockData";
import type { RestoreBackupProps } from "./RestoreBackup.types";

const RestoreBackupWithState = (props: RestoreBackupProps) => {
  const thirdPartyAccountProps = useMockSelectedThirdPartyAccountProps();
  const storageIdProps = useMockStorageIdProps();
  const formSettingsProps = useMockFormSettingsProps();

  return (
    <RestoreBackup
      {...props}
      {...thirdPartyAccountProps}
      {...storageIdProps}
      {...formSettingsProps}
    />
  );
};

const meta: Meta<typeof RestoreBackup> = {
  title: "Pages/Backup/RestoreBackup",
  component: RestoreBackupWithState,
  parameters: {
    docs: {
      description: {
        component: "Restore backup page component for DocSpace",
      },
    },
    msw: {
      handlers: [
        createGetBackupHistoryHandler(),
        createDeleteBackupHistoryHandler(),
        createDeleteBackupHandler(),
        createStartRestoreHandler(),
        createGetFolderTreeHandler(),
        createGetRoomsHandler(),
        createGetFolderInfoHandler(),
        createGetFolderHandler(true),
      ],
    },
  },
  argTypes: {
    navigate: { table: { disable: true } },
    setTenantStatus: { table: { disable: true } },
    setErrorInformation: { table: { disable: true } },
    setTemporaryLink: { table: { disable: true } },
    setDownloadingProgress: { table: { disable: true } },
    setConnectedThirdPartyAccount: { table: { disable: true } },
    setRestoreResource: { table: { disable: true } },
    clearLocalStorage: { table: { disable: true } },
    setSelectedThirdPartyAccount: { table: { disable: true } },
    setThirdPartyAccountsInfo: { table: { disable: true } },
    setCompletedFormFields: { table: { disable: true } },
    addValueInFormSettings: { table: { disable: true } },
    setRequiredFormSettings: { table: { disable: true } },
    deleteValueFormSetting: { table: { disable: true } },
    setIsThirdStorageChanged: { table: { disable: true } },
    isFormReady: { table: { disable: true } },
    getStorageParams: { table: { disable: true } },
    uploadLocalFile: { table: { disable: true } },
    toDefault: { table: { disable: true } },
    setBasePath: { table: { disable: true } },
    setNewPath: { table: { disable: true } },
    deleteThirdParty: { table: { disable: true } },
    openConnectWindow: { table: { disable: true } },
    setThirdPartyProviders: { table: { disable: true } },
    setConnectDialogVisible: { table: { disable: true } },
    setDeleteThirdPartyDialogVisible: { table: { disable: true } },
    setIsBackupProgressVisible: { table: { disable: true } },
    setBackupProgressError: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof RestoreBackup>;

export const Default: Story = {
  args: {
    removeItem: mockThirdPartyAccounts[0],
    isEnableRestore: true,
    navigate: () => {},
    settingsFileSelector: {
      getIcon: () => "",
    },
    isInitialLoading: false,
    standalone: false,
    setTenantStatus: () => {},
    errorInformation: "",
    isBackupProgressVisible: false,
    restoreResource: "backup.tar.gz",
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
    downloadingProgress: 0,
    selectedThirdPartyAccount: mockThirdPartyAccounts[0],
    connectedThirdPartyAccount: {
      id: "amazon-123",
      title: "Amazon S3",
      providerId: "amazon",
      providerKey: "amazon",
    },
    setErrorInformation: () => {},
    setTemporaryLink: () => {},
    setDownloadingProgress: () => {},
    setConnectedThirdPartyAccount: () => {},
    setRestoreResource: () => {},
    clearLocalStorage: () => {},
    setSelectedThirdPartyAccount: () => {},
    setThirdPartyAccountsInfo: async () => {},
    setCompletedFormFields: () => {},
    addValueInFormSettings: () => {},
    setRequiredFormSettings: () => {},
    deleteValueFormSetting: () => {},
    setIsThirdStorageChanged: () => {},
    isFormReady: () => true,
    getStorageParams: () => [],
    uploadLocalFile: async () => null,
    basePath: "/",
    newPath: "/",
    isErrorPath: false,
    toDefault: () => {},
    setBasePath: () => {},
    setNewPath: () => {},
    providers: mockThirdPartyProviders,
    deleteThirdParty: async () => {},
    openConnectWindow: async () => null,
    setThirdPartyProviders: () => {},
    connectDialogVisible: false,
    setConnectDialogVisible: () => {},
    deleteThirdPartyDialogVisible: false,
    setDeleteThirdPartyDialogVisible: () => {},
    setIsBackupProgressVisible: () => {},
    backupProgressError: "",
    setBackupProgressError: () => {},
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    errorInformation: "Error occurred during backup restoration",
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
    isEnableRestore: false,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    // isInitialLoading: true,
  },
};

export const Standalone: Story = {
  args: {
    ...Default.args,
    standalone: true,
  },
};
