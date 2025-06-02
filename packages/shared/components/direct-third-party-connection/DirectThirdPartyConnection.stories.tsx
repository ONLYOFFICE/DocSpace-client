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
import { ButtonSize } from "@docspace/shared/components/button";
import type {
  ThirdPartyAccountType,
  ConnectedThirdPartyAccountType,
} from "@docspace/shared/types";
import type { TThirdParties } from "@docspace/shared/api/files/types";
import type { FilesSelectorSettings } from "@docspace/shared/components/files-selector-input/FilesSelectorInput.types";

import DirectThirdPartyConnection from "./DirectThirdPartyConnection";
import {
  createGetFolderHandler,
  createGetFolderInfoHandler,
} from "../../__mocks__/storybook/handlers/files/folders";

const meta: Meta<typeof DirectThirdPartyConnection> = {
  title: "Components/DirectThirdPartyConnection",
  component: DirectThirdPartyConnection,
  parameters: {
    docs: {
      description: {
        component:
          "DirectThirdPartyConnection component for connecting to third-party services",
      },
    },
  },
  argTypes: {
    buttonSize: {
      control: "select",
      options: [ButtonSize.medium, ButtonSize.normal, ButtonSize.small],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DirectThirdPartyConnection>;

const mockAccounts: ThirdPartyAccountType[] = [
  {
    name: "ownCloud",
    label: "ownCloud",
    title: "ownCloud",
    provider_key: "ownCloud",
    key: "WebDav",
    storageIsConnected: false,
    connected: true,
    disabled: false,
  },
  {
    name: "Nextcloud",
    label: "Nextcloud",
    title: "Nextcloud",
    provider_key: "Nextcloud",
    key: "WebDav",
    storageIsConnected: false,
    connected: true,
    disabled: false,
  },
  {
    name: "WebDav",
    label: "WebDAV",
    title: "WebDAV",
    provider_key: "WebDav",
    key: "WebDav",
    storageIsConnected: false,
    connected: true,
    disabled: false,
  },
  {
    name: "kDrive",
    label: "kDrive",
    title: "kDrive",
    provider_key: "kDrive",
    key: "WebDav",
    storageIsConnected: false,
    connected: true,
    disabled: false,
  },
  {
    name: "Box",
    label: "Box (activation required)",
    title: "Box (activation required)",
    provider_key: "Box",
    key: "Box",
    storageIsConnected: false,
    connected: false,
    disabled: false,
  },
  {
    name: "Dropbox",
    label: "Dropbox (activation required)",
    title: "Dropbox (activation required)",
    provider_key: "DropboxV2",
    key: "DropboxV2",
    storageIsConnected: false,
    connected: false,
    disabled: false,
  },
  {
    name: "GoogleDrive",
    label: "Google Drive (activation required)",
    title: "Google Drive (activation required)",
    provider_key: "GoogleDrive",
    key: "GoogleDrive",
    storageIsConnected: false,
    connected: false,
    disabled: false,
  },
  {
    name: "OneDrive",
    label: "OneDrive (activation required)",
    title: "OneDrive (activation required)",
    provider_key: "OneDrive",
    key: "OneDrive",
    storageIsConnected: false,
    connected: false,
    disabled: false,
  },
];

const mockConnectedAccount: ConnectedThirdPartyAccountType = {
  id: "dropbox-123",
  title: "Dropbox",
  providerId: "dropbox",
  providerKey: "dropbox",
};

const mockProviders: TThirdParties = [
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
  {
    corporate: false,
    roomsStorage: false,
    customerTitle: "OneDrive",
    providerId: "onedrive",
    providerKey: "onedrive",
    provider_id: "onedrive",
    customer_title: "OneDrive",
  },
];

const mockFilesSelectorSettings: FilesSelectorSettings = {
  filesSettings: {
    automaticallyCleanUp: {
      gap: 30,
      isAutoCleanUp: false,
    },
    canSearchByContent: true,
    chunkUploadSize: 1024,
    maxUploadThreadCount: 2,
    confirmDelete: true,
    convertNotify: true,
    defaultOrder: { is_asc: true, property: 0 },
    defaultSharingAccessRights: [0, 1],
    downloadTarGz: true,
    enableThirdParty: true,
    externalShare: true,
    externalShareSocialMedia: true,
    extsArchive: [".zip", ".rar"],
    extsAudio: [".mp3", ".wav"],
    extsCoAuthoring: [".docx", ".xlsx"],
    extsConvertible: { docx: [".doc", ".docx"] },
    extsDocument: [".doc", ".docx", ".pdf"],
    extsImage: [".jpg", ".png"],
    extsImagePreviewed: [".jpg", ".png"],
    extsMediaPreviewed: [".mp4", ".avi"],
    extsMustConvert: [".doc"],
    extsPresentation: [".ppt", ".pptx"],
    extsSpreadsheet: [".xls", ".xlsx"],
    extsUploadable: [
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".pdf",
      ".txt",
      ".jpg",
      ".png",
    ],
    extsVideo: [".mp4", ".avi"],
    extsWebCommented: [".docx", ".xlsx"],
    extsWebCustomFilterEditing: [".xlsx"],
    extsWebEdited: [".docx", ".xlsx", ".pptx"],
    extsWebEncrypt: [".docx", ".xlsx"],
    extsWebPreviewed: [".docx", ".xlsx", ".pptx", ".pdf"],
    extsWebRestrictedEditing: [".docx"],
    extsWebReviewed: [".docx"],
    extsWebTemplate: [".docx", ".xlsx"],
    favoritesSection: true,
    fileDownloadUrlString: "download",
    fileRedirectPreviewUrlString: "preview",
    fileThumbnailUrlString: "thumbnail",
    fileWebEditorExternalUrlString: "edit",
    fileWebEditorUrlString: "edit",
    fileWebViewerExternalUrlString: "view",
    fileWebViewerUrlString: "view",
    forcesave: true,
    hideConfirmConvertOpen: false,
    hideConfirmConvertSave: false,
    internalFormats: {
      Document: "docx",
      Presentation: "pptx",
      Spreadsheet: "xlsx",
      Pdf: "pdf",
    },
    keepNewFileName: true,
    masterFormExtension: ".docxf",
    paramOutType: "out",
    paramVersion: "version",
    recentSection: true,
    storeForcesave: true,
    storeOriginalFiles: true,
    templatesSection: true,
    openEditorInSameTab: true,
    displayFileExtension: true,
  },
};

const baseArgs = {
  openConnectWindow: async () => window,
  connectDialogVisible: false,
  deleteThirdPartyDialogVisible: false,
  setConnectDialogVisible: () => {},
  setDeleteThirdPartyDialogVisible: () => {},
  clearLocalStorage: () => {},
  setSelectedThirdPartyAccount: () => {},
  setThirdPartyAccountsInfo: async () => {},
  deleteThirdParty: async () => {},
  setConnectedThirdPartyAccount: () => {},
  setThirdPartyProviders: () => {},
  providers: mockProviders,
  removeItem: mockAccounts[1],
  newPath: "/",
  basePath: "/",
  isErrorPath: false,
  filesSelectorSettings: mockFilesSelectorSettings,
  setBasePath: () => {},
  toDefault: () => {},
  setNewPath: () => {},
  accounts: mockAccounts,
  buttonSize: ButtonSize.normal,
  onSelectFolder: () => {},
  onSelectFile: () => {},
};

export const Default: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: null,
    selectedThirdPartyAccount: mockAccounts[0],
    isTheSameThirdPartyAccount: false,
  },
};

export const Connected: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[2],
    isTheSameThirdPartyAccount: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};

export const WithError: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[0],
    isTheSameThirdPartyAccount: true,
    isError: true,
    isErrorPath: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};

export const Disabled: Story = {
  args: {
    ...baseArgs,
    connectedThirdPartyAccount: mockConnectedAccount,
    selectedThirdPartyAccount: mockAccounts[0],
    isTheSameThirdPartyAccount: true,
    isDisabled: true,
  },
  parameters: {
    msw: {
      handlers: [createGetFolderInfoHandler(), createGetFolderHandler()],
    },
  },
};
