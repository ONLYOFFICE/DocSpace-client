import type { TFile } from "@docspace/shared/api/files/types";
import type { DeviceType } from "@docspace/shared/enums";
import type { PlaylistType } from "../../MediaViewer.types";

interface ViewerWrapperProps {
  title: string;
  visible: boolean;
  fileUrl?: string;
  targetFile?: TFile;
  playlistPos: number;
  userAccess?: boolean;
  playlist: PlaylistType[];
  currentDeviceType?: DeviceType;

  isPdf: boolean;
  isImage: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isPreviewFile: boolean;

  errorTitle: string;
  headerIcon: string;
  audioIcon: string;

  onClose?: VoidFunction;
  onPrevClick?: VoidFunction;
  onNextClick?: VoidFunction;
  onDeleteClick?: VoidFunction;
  onDownloadClick?: VoidFunction;

  onSetSelectionFile: VoidFunction;
  contextModel: () => ContextMenuModel[];
}

export default ViewerWrapperProps;
