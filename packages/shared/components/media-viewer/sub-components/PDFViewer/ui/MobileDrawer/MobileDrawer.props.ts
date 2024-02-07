import { Dispatch, SetStateAction } from "react";
import { BookMarkType } from "../../PDFViewer.props";

interface MobileDrawerProps {
  bookmarks: BookMarkType[];
  isOpenMobileDrawer: boolean;
  navigate: (page: number) => void;
  setIsOpenMobileDrawer: Dispatch<SetStateAction<boolean>>;
  resizePDFThumbnail: VoidFunction;
}

export default MobileDrawerProps;
