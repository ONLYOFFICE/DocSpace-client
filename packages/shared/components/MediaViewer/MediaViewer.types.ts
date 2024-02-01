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
  t: TranslationType;

  userAccess: boolean;
  currentFileId: NumberOrString;

  visible: boolean;

  extsImagePreviewed: string[];

  files: TFile[];
  playlist: PlaylistType[];
  playlistPos: number;

  deleteDialogVisible?: boolean;
  isPreviewFile: boolean;
  archiveRoomsId?: number;

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

  getIcon: (size: number, ext: string, ...arg: unknown[]) => string;

  onClose?: VoidFunction;
  onError?: VoidFunction;
  nextMedia?: VoidFunction;
  prevMedia?: VoidFunction;
  onMoveAction?: VoidFunction;
  onCopyAction?: VoidFunction;
  onCopyLink?: ContextMenuAction;
  onDuplicate?: ContextMenuAction;
  onClickDownloadAs?: VoidFunction;
  onClickDelete?: ContextMenuAction;
  onClickDownload?: ContextMenuAction;
  onEmptyPlaylistError?: VoidFunction;
  onDelete?: (id: NumberOrString) => void;
  onDownload?: (id: NumberOrString) => void;
  onChangeUrl?: (id: NumberOrString) => void;
  onClickRename?: OmitSecondArg<ContextMenuAction>;
  onPreviewClick?: OmitSecondArg<ContextMenuAction>;
  onClickLinkEdit?: OmitSecondArg<ContextMenuAction>;
  onShowInfoPanel?: OmitSecondArg<ContextMenuAction>;

  setBufferSelection?: (file?: TFile | null) => void;
  setActiveFiles?: (files: number[], destId?: number) => void;
}
