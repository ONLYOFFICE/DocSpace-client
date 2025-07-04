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

import type { FilesSelectorSettings } from "./FilesSelectorInput.types";

export const mockSetBasePath = jest.fn();
export const mockToDefault = jest.fn();
export const mockSetNewPath = jest.fn();
export const mockOnSelectFolder = jest.fn();

export const mockFilesSelectorSettings: FilesSelectorSettings = {
  filesSettings: {
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
    extsDiagram: [".vsdx"],
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

export const mockDefaultProps = {
  newPath: "/Rooms",
  basePath: "/",
  isErrorPath: false,
  setBasePath: mockSetBasePath,
  toDefault: mockToDefault,
  setNewPath: mockSetNewPath,
  filesSelectorSettings: mockFilesSelectorSettings,
  onSelectFolder: mockOnSelectFolder,
};
