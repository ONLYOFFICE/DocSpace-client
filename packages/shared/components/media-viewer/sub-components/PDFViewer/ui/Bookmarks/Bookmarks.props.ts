import { BookMarkType } from "../../PDFViewer.props";

interface BookmarksProps {
  bookmarks: BookMarkType[];
  navigate: (page: number) => void;
}

export default BookmarksProps;
