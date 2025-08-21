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

import { RoomsType, ThemeKeys } from "../enums";

export type TFrameType = "desktop" | "mobile";

export type TFrameMode =
  | "manager"
  | "editor"
  | "viewer"
  | "room-selector"
  | "file-selector"
  | "system";

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
  integrationMode?: string;
  macros?: boolean;
  macrosMode?: string;
  mentionShare?: boolean;
  mobileForceView?: boolean;
  plugins?: boolean;
  toolbarHideFileName?: boolean;
  toolbarNoTabs?: boolean;
  uiTheme?: string;
  unit?: string;
  zoom?: number;
};

export type TFrameEvents = {
  onAppError?: null | ((e: Event | string) => void);
  onAppReady?: null | (() => void);
  onAuthSuccess?: null | (() => void);
  onCloseCallback?: null | ((e: Event) => void);
  onContentReady?: null | (() => void);
  onDownload?: null | ((e: Event | string) => void);
  onEditorCloseCallback?: null | ((e: Event) => void);
  onNoAccess?: null | (() => void);
  onNotFound?: null | (() => void);
  onSelectCallback?: null | ((e: Event | object) => void);
  onSignOut?: null | (() => void);
  onEditorOpen?: null | ((e: Event | object) => void);
  onFileManagerClick?: null | ((e: Event | object) => void);
};

export type TFrameConfig = {
  acceptButtonLabel?: string;
  buttonColor?: string;
  cancelButtonLabel?: string;
  checkCSP?: boolean;
  destroyText?: string;
  disableActionButton?: boolean;
  downloadToEvent?: boolean;
  editorCustomization?: TEditorCustomization | object;
  editorGoBack?: boolean | string;
  editorType?: string;
  events?: TFrameEvents;
  filter?: TFrameFilter;
  filterParam?: string;
  frameId: string;
  height?: string;
  id?: string | number | null;
  infoPanelVisible?: boolean;
  init?: boolean | null;
  isSDK?: boolean;
  locale?: string | null;
  mode: TFrameMode | string;
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
  theme?: TFrameTheme | string;
  type?: TFrameType;
  viewAs?: TFrameViewAs;
  viewTableColumns?: string;
  waiting?: boolean;
  width?: string;
  withBreadCrumbs?: boolean;
  withSearch?: boolean;
  withSubtitle?: boolean;
};
