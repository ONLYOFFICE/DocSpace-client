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
};
