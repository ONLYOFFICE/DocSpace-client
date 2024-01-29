import type { ContextMenuModel, IFile, PlaylistType } from "../../types";

interface ViewerWrapperProps {
  title: string;
  visible: boolean;
  fileUrl?: string;
  targetFile?: IFile;
  playlistPos: number;
  userAccess: boolean;
  playlist: PlaylistType[];

  isPdf: boolean;
  isImage: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isPreviewFile: boolean;

  errorTitle: string;
  headerIcon: string;
  audioIcon: string;

  onClose: VoidFunction;
  onPrevClick: VoidFunction;
  onNextClick: VoidFunction;
  onDeleteClick: VoidFunction;
  onDownloadClick: VoidFunction;
  onSetSelectionFile: VoidFunction;
  contextModel: () => ContextMenuModel[];
}

export default ViewerWrapperProps;
