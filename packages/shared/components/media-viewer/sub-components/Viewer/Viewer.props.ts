import type { TFile } from "@docspace/shared/api/files/types";
import type { ContextMenuModel } from "@docspace/shared/components/context-menu";
import type { DeviceType } from "@docspace/shared/enums";
import { getCustomToolbar } from "../../helpers/getCustomToolbar";
import type { PlaylistType } from "../../MediaViewer.types";

interface ViewerProps {
  targetFile?: TFile;
  title: string;
  fileUrl?: string;
  isAudio: boolean;
  isVideo: boolean;
  visible: boolean;
  isImage: boolean;
  isPdf: boolean;

  playlist: PlaylistType[];

  audioIcon: string;
  errorTitle: string;
  headerIcon: string;
  toolbar: ReturnType<typeof getCustomToolbar>;
  playlistPos: number;
  isPreviewFile: boolean;

  currentDeviceType?: DeviceType;

  onMaskClick?: VoidFunction;
  onNextClick?: VoidFunction;
  onPrevClick?: VoidFunction;
  contextModel: () => ContextMenuModel[];
  onDownloadClick?: VoidFunction;
  generateContextMenu: (
    isOpen: boolean,
    right?: string,
    bottom?: string,
  ) => JSX.Element;
  onSetSelectionFile: VoidFunction;
}

export default ViewerProps;
