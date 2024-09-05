// (c) Copyright Ascensio System SIA 2009-2024
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

import { ThemeKeys } from "../enums";

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
  count: number;
  page: number;
  sortorder: "descending" | "ascending";
  sortby:
    | "DateAndTime"
    | "AZ"
    | "Type"
    | "Size"
    | "DateAndTimeCreation"
    | "Author";
  search: string;
  withSubfolders: boolean;
};

export type TFrameEvents = {
  onSelectCallback: null | ((e: Event) => void);
  onCloseCallback: null | ((e: Event) => void);
  onAppReady: null | ((e: Event) => void);
  onAppError: null | ((e: Event) => void);
  onEditorCloseCallback: null | ((e: Event) => void);
  onAuthSuccess: null | ((e: Event) => void);
  onSignOut: null | ((e: Event) => void);
  onDownload: null | ((e: Event) => void);
  onNoAccess: null | ((e: Event) => void);
  onNotFound: null | ((e: Event) => void);
};

export type TFrameConfig = {
  src: string;
  rootPath: string;
  requestToken: string | null;
  width: string;
  height: string;
  name: string;
  type: TFrameType;
  frameId: string;
  mode: TFrameMode;
  id: string | null;
  locale: string | null;
  theme: TFrameTheme;
  editorType: TFrameEditorType;
  editorGoBack: boolean;
  selectorType: TFrameSelectorType;
  showSelectorCancel: boolean;
  showSelectorHeader: boolean;
  showHeader: boolean;
  showHeaderBanner: string;
  showTitle: boolean;
  showMenu: boolean;
  showFilter: boolean;
  destroyText: string;
  viewAs: TFrameViewAs;
  viewTableColumns: string;
  checkCSP: boolean;
  downloadToEvent: boolean;
  filter: TFrameFilter;
  keysForReload: string[];
  events: TFrameEvents;
  showSignOut: boolean;
};
