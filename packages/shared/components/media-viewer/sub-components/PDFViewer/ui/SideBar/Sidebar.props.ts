import { Dispatch, SetStateAction } from "react";
import { BookMarkType } from "../../PDFViewer.props";

interface SidebarProps {
  isPanelOpen: boolean;
  setIsPDFSidebarOpen: Dispatch<SetStateAction<boolean>>;
  bookmarks: BookMarkType[];
  navigate: (page: number) => void;
}

export default SidebarProps;
