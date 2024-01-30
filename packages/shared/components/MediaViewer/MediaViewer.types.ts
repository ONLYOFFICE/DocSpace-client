import type { TFile } from "@docspace/shared/api/files/types";

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
  t: TranslationType;

  userAccess: boolean;
  currentFileId: NumberOrString;

  visible: boolean;

  extsMediaPreviewed: string[];
  extsImagePreviewed: string[];

  deleteDialogVisible: boolean;
  errorLabel: string;
  isPreviewFile: boolean;

  files: TFile[];

  playlist: PlaylistType[];

  archiveRoomsId: number;

  playlistPos: number;

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

  setActiveFiles: (files: number[], destId?: number) => void;
  setBufferSelection: (file?: TFile | null) => void;

  getIcon: (size: number, ext: string, ...arg: unknown[]) => string;

  onClose: VoidFunction;
  onError?: VoidFunction;
  onEmptyPlaylistError: VoidFunction;
  onChangeUrl: (id: NumberOrString) => void;
  onShowInfoPanel: OmitSecondArg<ContextMenuAction>;
  onDelete: (id: NumberOrString) => void;
  onDownload: (id: NumberOrString) => void;

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

  nextMedia: VoidFunction;
  prevMedia: VoidFunction;
}
