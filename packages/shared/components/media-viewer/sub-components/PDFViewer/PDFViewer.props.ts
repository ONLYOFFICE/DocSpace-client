import type { Dispatch, SetStateAction } from "react";
import type { DevicesType } from "../../MediaViewer.types";
import type { getPDFToolbar } from "../../MediaViewer.helpers";

interface PDFViewerProps {
  src: string;
  title: string;
  toolbar: ReturnType<typeof getPDFToolbar>;
  isPDFSidebarOpen: boolean;
  mobileDetails: JSX.Element;

  isLastImage: boolean;
  isFistImage: boolean;
  devices: DevicesType;

  onMask: VoidFunction;
  generateContextMenu: (
    isOpen: boolean,
    right?: string,
    bottom?: string,
  ) => JSX.Element;
  setIsOpenContextMenu: Dispatch<SetStateAction<boolean>>;
  setIsPDFSidebarOpen: Dispatch<SetStateAction<boolean>>;

  onPrev?: VoidFunction;
  onNext?: VoidFunction;
}

export type BookMarkType = {
  description: string;
  level: number;
  page: number;
  y: number;
};

export default PDFViewerProps;
