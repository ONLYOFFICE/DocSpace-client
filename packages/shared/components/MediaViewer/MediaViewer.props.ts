import {
  ContextMenuAction,
  IFile,
  NumberOrString,
  OmitSecondArg,
  PlaylistType,
  TranslationType,
} from "./types";

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

  files: IFile[];

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
  setBufferSelection: (file?: IFile | null) => void;

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
