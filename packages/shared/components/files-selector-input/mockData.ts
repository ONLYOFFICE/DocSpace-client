/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from "vitest";
import type { FilesSelectorSettings } from "./FilesSelectorInput.types";

export const mockSetBasePath = vi.fn();
export const mockToDefault = vi.fn();
export const mockSetNewPath = vi.fn();
export const mockOnSelectFolder = vi.fn();

export const mockFilesSelectorSettings: FilesSelectorSettings = {
  filesSettings: {
    automaticallyCleanUp: {
      gap: 3,
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
    organizeRoomsGrouping: false,
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
