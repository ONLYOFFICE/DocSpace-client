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

import { Meta, StoryObj } from "@storybook/react";
import { DeviceType } from "../../enums";
import type { TBreadCrumb } from "../selector/Selector.types";

import { FilesSelectorInput } from "./index";
import {
  createCreateRoomsHandler,
  createGetRoomsHandler,
} from "../../__mocks__/storybook/handlers/files/rooms";
import { createGetFolderHandler } from "../../__mocks__/storybook/handlers/files/folders";
import { createGetFolderTreeHandler } from "../../__mocks__/storybook/handlers/files/foldersTree";

const meta = {
  title: "Components/FilesSelectorInput",
  component: FilesSelectorInput,
  parameters: {
    docs: {
      description: {
        component:
          "Component for selecting files or folders with a file browser dialog",
      },
    },
    msw: {
      handlers: [
        createGetFolderTreeHandler(),
        createGetRoomsHandler(),
        createGetFolderHandler(),
        createCreateRoomsHandler(),
      ],
    },
  },
  argTypes: {
    isThirdParty: {
      description: "Flag indicating if third-party storage is used",
      control: "boolean",
    },
    isRoomsOnly: {
      description: "Flag indicating if only rooms should be shown",
      control: "boolean",
    },
    withCreate: {
      description: "Flag indicating if creation of new items is allowed",
      control: "boolean",
    },
    isSelectFolder: {
      description: "Flag indicating if folder selection is enabled",
      control: "boolean",
    },
    isDisabled: {
      description: "Flag indicating if the component is disabled",
      control: "boolean",
    },
    isError: {
      description: "Flag indicating if there is an error state",
      control: "boolean",
    },
    maxWidth: {
      description: "Maximum width of the component",
      control: "text",
    },
    filterParam: {
      description: "Filter parameter for file selection",
      control: "select",
      options: [
        "DOCX",
        "PDF",
        "IMG",
        "GZ",
        "DOCXF",
        "XLSX",
        "ALL",
        "BackupOnly",
      ],
    },
    descriptionText: {
      description: "Description text for the component",
      control: "text",
    },
    currentDeviceType: {
      description: "Current device type",
      control: "select",
      options: Object.values(DeviceType),
    },
  },
} satisfies Meta<typeof FilesSelectorInput>;

export default meta;
type Story = StoryObj<typeof FilesSelectorInput>;

const mockSetBasePath = (folders: TBreadCrumb[]) => {
  console.log("setBasePath called with:", folders);
};

const mockToDefault = () => {
  console.log("toDefault called");
};

const mockSetNewPath = (folders: TBreadCrumb[], fileName?: string) => {
  console.log("setNewPath called with:", { folders, fileName });
};

const mockOnSelectFolder = (
  value: number | string | undefined,
  breadCrumbs: TBreadCrumb,
) => {
  console.log("onSelectFolder called with:", { value, breadCrumbs });
};

// This is the correct structure for FilesSelectorSettings type
const mockFilesSelectorSettings = {
  filesSettings: {
    canShare: true,
    canWebEdit: true,
    canSearch: true,
    canCreateFiles: true,
    canUploadFiles: true,
    canCreateFolders: true,
    automaticallyCleanUp: {
      gap: 30,
      isAutoCleanUp: false,
    },
    canSearchByContent: true,
    chunkUploadSize: 1048576,
    maxUploadThreadCount: 2,
    confirmDelete: true,
    convertNotify: true,
    defaultOrder: { is_asc: true, property: 0 },
    defaultSharingAccessRights: [0, 1, 2],
    downloadTarGz: true,
    enableThirdParty: true,
    externalShare: true,
    externalShareSocialMedia: true,
    extsArchive: [".zip", ".rar"],
    extsAudio: [".mp3", ".wav"],
    extsCoAuthoring: [".docx", ".xlsx"],
    extsConvertible: { ".docx": [".pdf"] },
    extsDocument: [".doc", ".docx"],
    extsDiagram: [".vsdx", ".vsd"],
    extsImage: [".jpg", ".png"],
    extsImagePreviewed: [".jpg", ".png"],
    extsMediaPreviewed: [".mp4", ".mp3"],
    extsMustConvert: [".doc"],
    extsPresentation: [".ppt", ".pptx"],
    extsSpreadsheet: [".xls", ".xlsx"],
    extsUploadable: [".docx", ".xlsx", ".pdf"],
    extsVideo: [".mp4", ".avi"],
    extsWebCommented: [".docx"],
    extsWebCustomFilterEditing: [".xlsx"],
    extsWebEdited: [".docx", ".xlsx"],
    extsWebEncrypt: [".pdf"],
    extsWebPreviewed: [".docx", ".pdf"],
    extsWebRestrictedEditing: [".docx"],
    extsWebReviewed: [".docx"],
    extsWebTemplate: [".docx"],
    favoritesSection: true,
    fileDownloadUrlString: "/download",
    fileRedirectPreviewUrlString: "/preview",
    fileThumbnailUrlString: "/thumbnail",
    fileWebEditorExternalUrlString: "/editor",
    fileWebEditorUrlString: "/editor",
    fileWebViewerExternalUrlString: "/viewer",
    fileWebViewerUrlString: "/viewer",
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
    paramOutType: "type",
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
  newPath: "/Rooms",
  basePath: "/",
  isErrorPath: false,
  setBasePath: mockSetBasePath,
  toDefault: mockToDefault,
  setNewPath: mockSetNewPath,
  // Explicitly set filesSelectorSettings to match the expected type
  filesSelectorSettings: {
    filesSettings: mockFilesSelectorSettings.filesSettings,
  },
};

export const Default: Story = {
  args: {
    ...baseArgs,
    onSelectFolder: mockOnSelectFolder,
  },
};

export const Disabled: Story = {
  args: {
    ...baseArgs,
    isDisabled: true,
    onSelectFolder: mockOnSelectFolder,
  },
};

export const WithError: Story = {
  args: {
    ...baseArgs,
    isError: true,
    isErrorPath: true,
    onSelectFolder: mockOnSelectFolder,
  },
};

export const CustomWidth: Story = {
  args: {
    ...baseArgs,
    maxWidth: "500px",
    onSelectFolder: mockOnSelectFolder,
  },
};
