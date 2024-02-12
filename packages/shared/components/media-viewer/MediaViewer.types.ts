import type { TFile } from "@docspace/shared/api/files/types";
import type { DeviceType } from "@docspace/shared/enums";

export type ContextMenuAction = (file: TFile, t: TranslationType) => void;

export type OmitSecondArg<F> = F extends (x: infer P, ...arg: never) => infer R
  ? (file: P) => R
  : F;

export type TranslationType = (key: string, opt?: object) => string;

export type NumberOrString = number | string;

export type NullOrUndefined = null | undefined;

export type DevicesType = {
  isMobile: boolean;
  isMobileOnly: boolean;
  isDesktop: boolean;
};

export type ContextFunctions = Partial<{
  onClickDownloadAs: VoidFunction;
  onMoveAction: VoidFunction;
  onCopyAction: VoidFunction;
  onClickRename: OmitSecondArg<ContextMenuAction>;
  onDuplicate: ContextMenuAction;
  onClickDelete: ContextMenuAction;
  onClickDownload: ContextMenuAction;
  onClickLinkEdit: OmitSecondArg<ContextMenuAction>;
  onPreviewClick: OmitSecondArg<ContextMenuAction>;
  onCopyLink: ContextMenuAction;
  onShowInfoPanel: OmitSecondArg<ContextMenuAction>;
}>;

export type PlaylistType = {
  id: number;
  canShare: boolean;
  fileExst: string;
  fileId: number;
  fileStatus: number;
  src: string;
  title: string;
  thumbnailUrl: string;
  version: number;
};

export type BoundsType = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type Point = { x: number; y: number };

export interface MediaViewerProps {
  /** Function for translating text. */
  t: TranslationType;
  /** List of media files to be displayed. */
  files: TFile[];
  /** Specifies whether the media viewer is visible. */
  visible: boolean;
  /** Position of the current file in the playlist. */
  playlistPos: number;
  /** Indicates if the current file is a preview. */
  isPreviewFile: boolean;
  /** List of playlists. */
  playlist: PlaylistType[];
  /** List of file extensions that can be previewed as images. */
  extsImagePreviewed: string[];
  /** ID of the current file. */
  currentFileId: NumberOrString;
  /** Function to get the icon for a file based on its size and extension. */
  getIcon: (size: number, ext: string, ...arg: unknown[]) => string;
  /** Type of the current device. */
  currentDeviceType?: DeviceType;
  /** Specifies whether the delete dialog is visible. */
  deleteDialogVisible?: boolean;
  /** Specifies whether the user has access. */
  userAccess?: boolean;
  /** ID of the archive room. */
  archiveRoomsId?: number;
  /** Context menu items for plugins. */
  pluginContextMenuItems?: {
    key: string;
    value: {
      label: string;
      onClick: (id: number) => Promise<void>;
      icon: string;
      fileType?: ["video", "image"];
      withActiveItem?: boolean;
    };
  }[];
  /** Callback function called when the media viewer is closed. */
  onClose?: VoidFunction;
  /** Callback function called when an error occurs. */
  onError?: VoidFunction;
  /** Callback function to view the next media file. */
  nextMedia?: VoidFunction;
  /** Callback function to view the previous media file. */
  prevMedia?: VoidFunction;
  /** Callback function called on move action. */
  onMoveAction?: VoidFunction;
  /** Callback function called on copy action. */
  onCopyAction?: VoidFunction;
  /** Callback function called on copy link action. */
  onCopyLink?: ContextMenuAction;
  /** Callback function called on duplicate action. */
  onDuplicate?: ContextMenuAction;
  /** Callback function called on "Download As" action. */
  onClickDownloadAs?: VoidFunction;
  /** Callback function called on delete action. */
  onClickDelete?: ContextMenuAction;
  /** Callback function called on download action. */
  onClickDownload?: ContextMenuAction;
  /** Callback function called on an error when the playlist is empty. */
  onEmptyPlaylistError?: VoidFunction;
  /** Callback function called on delete action for a specific file. */
  onDelete?: (id: NumberOrString) => void;
  /** Callback function called on download action for a specific file. */
  onDownload?: (id: NumberOrString) => void;
  /** Callback function called when the URL changes for a specific file. */
  onChangeUrl?: (id: NumberOrString) => void;
  /** Callback function called on rename action. */
  onClickRename?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on preview click action. */
  onPreviewClick?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on link edit action. */
  onClickLinkEdit?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on show info panel action. */
  onShowInfoPanel?: OmitSecondArg<ContextMenuAction>;
  /** Function to set the buffer selection for a file. */
  setBufferSelection?: (file?: TFile | null) => void;
  /** Function to set the active files based on their IDs. */
  setActiveFiles?: (files: number[], destId?: number) => void;
}
