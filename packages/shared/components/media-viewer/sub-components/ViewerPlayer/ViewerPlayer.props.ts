import { DevicesType } from "../../MediaViewer.types";

interface ViewerPlayerProps {
  src?: string;
  isAudio: boolean;
  isVideo: boolean;
  isError: boolean;
  audioIcon: string;
  errorTitle: string;
  canDownload: boolean;
  isLastImage: boolean;
  isFistImage: boolean;
  isFullScreen: boolean;
  panelVisible: boolean;
  isPreviewFile: boolean;
  isOpenContextMenu: boolean;
  mobileDetails: JSX.Element;
  thumbnailSrc?: string;
  devices: DevicesType;
  onMask?: VoidFunction;
  onPrev?: VoidFunction;
  onNext?: VoidFunction;
  onDownloadClick?: VoidFunction;
  contextModel: () => ContextMenuModel[];
  removeToolbarVisibleTimer: VoidFunction;
  removePanelVisibleTimeout: VoidFunction;
  restartToolbarVisibleTimer: VoidFunction;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;

  generateContextMenu: (
    isOpen: boolean,
    right?: string,
    bottom?: string,
  ) => JSX.Element;
}

export default ViewerPlayerProps;
