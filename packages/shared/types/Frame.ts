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

import { RoomsType, ThemeKeys } from "../enums";

export type TFrameType = "desktop" | "mobile";

export type TFrameMode =
  | "manager"
  | "editor"
  | "viewer"
  | "room-selector"
  | "file-selector"
  | "system"
  | "forms"
  | "chat";

export type TFrameSelectorType =
  | "roomsOnly"
  | "userFolderOnly"
  | "exceptPrivacyTrashArchiveFolders"
  | "exceptSortedByTagsFolders";

export type TFrameEditorType = "desktop" | "embedded";

export type TFrameViewAs = "row" | "table" | "tile";

export type TFrameTheme =
  | ThemeKeys.BaseStr
  | ThemeKeys.DarkStr
  | ThemeKeys.SystemStr;

export type TFrameFilter = {
  count?: string;
  page?: string;
  sortorder?: "descending" | "ascending";
  sortby?:
    | "DateAndTime"
    | "AZ"
    | "Type"
    | "Size"
    | "DateAndTimeCreation"
    | "Author";
  search?: string;
  withSubfolders?: boolean;
};

export type TEditorCustomization = {
  anonymous?: {
    request?: boolean;
    label?: string;
  };
  autosave?: boolean;
  comments?: boolean;
  compactHeader?: boolean;
  compactToolbar?: boolean;
  compatibleFeatures?: boolean;
  forcesave?: boolean;
  help?: boolean;
  hideRightMenu?: boolean;
  hideRulers?: boolean;
  integrationMode?: "embed";
  macros?: boolean;
  macrosMode?: "disable" | "warn" | "enable";
  mentionShare?: boolean;
  mobileForceView?: boolean;
  plugins?: boolean;
  toolbarHideFileName?: boolean;
  toolbarNoTabs?: boolean;
  uiTheme?: string;
  unit?: "cm" | "pt" | "inch";
  zoom?: number;
};

export type TFrameEvents = {
  onAppError?: null | ((message: string) => void);
  onAppReady?: null | ((data: { frameId: string }) => void);
  onAuthSuccess?: null | ((data: object) => void);
  onCloseCallback?: null | (() => void);
  onContentReady?: null | (() => void);
  onCustomAction?:
    | null
    | ((data: { action: string; type: string; item: object }) => void);
  onDownload?: null | ((url: string) => void);
  onEditorCloseCallback?: null | (() => void);
  onEditorOpen?: null | ((data: object) => void);
  onFileManagerClick?: null | ((data: object) => void);
  onNavigate?: null | ((data: { section: string }) => void);
  onNoAccess?: null | (() => void);
  onNotFound?: null | (() => void);
  onSelectCallback?: null | ((item: object) => void);
  onSignOut?: null | (() => void);
  onUploadError?:
    | null
    | ((data: {
        fileName: string;
        message: string;
        uploadId?: number;
      }) => void);
  onUploadProgress?: null | ((data: object) => void);
  onUploadSuccess?:
    | null
    | ((data: {
        fileName: string;
        fileSize: number;
        uploadId?: number;
      }) => void);
};

export type TFrameConfig = {
  acceptButtonLabel?: string;
  buttonColor?: string;
  cancelButtonLabel?: string;
  checkCSP?: boolean;
  destroyText?: string;
  disableActionButton?: boolean;
  downloadToEvent?: boolean;
  editorCustomization?: TEditorCustomization;
  editorGoBack?: boolean | "event";
  withoutGoBackText?: boolean;
  editorType?: string;
  events?: TFrameEvents;
  filter?: TFrameFilter;
  filterParam?: string;
  frameId: string;
  headerOffset?: number;
  headerHeight?: number;
  height?: string;
  id?: string | number | null;
  infoPanelVisible?: boolean;
  init?: boolean | null;
  integrationUrl?: string;
  isSDK?: boolean;
  locale?: string | null;
  mode?: TFrameMode;
  name?: string;
  requestToken?: string | null;
  roomType?: RoomsType | RoomsType[];
  rootPath?: string;
  selectorType?: TFrameSelectorType;
  showFilter?: boolean;
  showHeader?: boolean;
  showHeaderBanner?: string;
  showMenu?: boolean;
  showSelectorCancel?: boolean;
  showSelectorHeader?: boolean;
  showSettings?: boolean;
  showSignOut?: boolean;
  showTitle?: boolean;
  src: string;
  stylesUrl?: string | null;
  theme?: TFrameTheme;
  type?: TFrameType;
  viewAs?: TFrameViewAs;
  libraryId?: string | number;
  viewTableColumns?: string;
  waiting?: boolean;
  width?: string;
  withBreadCrumbs?: boolean;
  withSearch?: boolean;
  withSubtitle?: boolean;
};
