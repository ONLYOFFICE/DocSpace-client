import type { Dispatch, SetStateAction } from "react";
import type { ContextMenuModel } from "@docspace/shared/components/context-menu";

import { getCustomToolbar } from "../../helpers/getCustomToolbar";
import type { DevicesType } from "../../MediaViewer.types";

interface ImageViewerProps {
  src?: string;
  thumbnailSrc?: string;
  isTiff?: boolean;
  imageId: number;
  version: number;
  errorTitle: string;
  isFistImage: boolean;
  isLastImage: boolean;
  panelVisible: boolean;
  mobileDetails: JSX.Element;
  toolbar: ReturnType<typeof getCustomToolbar>;
  devices: DevicesType;

  onPrev?: VoidFunction;
  onNext?: VoidFunction;
  onMask?: VoidFunction;
  contextModel: () => ContextMenuModel[];
  resetToolbarVisibleTimer: VoidFunction;
  setIsOpenContextMenu: Dispatch<SetStateAction<boolean>>;
  generateContextMenu: (
    isOpen: boolean,
    right?: string,
    bottom?: string,
  ) => JSX.Element;
}

export default ImageViewerProps;
