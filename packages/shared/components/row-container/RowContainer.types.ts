import { IndexRange } from "react-virtualized";

export interface RowContainerProps {
  /** Height of one Row element. Required for the proper functioning of the scroll */
  itemHeight: number;
  /** Allows setting fixed block height for Row */
  manualHeight?: string;
  /** Child elements */
  children: React.ReactNode[];
  /** Enables react-window for efficient rendering of large lists */
  useReactWindow: boolean;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets a callback function that is called when the list scroll positions change */
  onScroll: () => void;
  /** The property required for the infinite loader */
  filesLength: number;
  /** The property required for the infinite loader */
  itemCount: number;
  /** The property required for the infinite loader */
  fetchMoreFiles: (params: IndexRange) => Promise<void>;
  /** The property required for the infinite loader */
  hasMoreFiles: boolean;
}
