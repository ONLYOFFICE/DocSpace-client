import { ScrollbarType } from "./Scrollbar.enums";

export interface ScrollbarProps {
  /** Accepts class */
  className?: string;
  /** Accepts id  */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Enable tracks auto hiding.  */
  autoHide?: boolean;
  /** Track auto hiding delay in ms.  */
  hideTrackTimer?: number;
  /** Fix scrollbar size. */
  fixedSize?: boolean;
  /** Disable vertical scrolling. */
  noScrollY?: boolean;
  /** Disable horizontal scrolling. */
  noScrollX?: boolean;

  onScroll?: React.UIEventHandler<HTMLDivElement>;
  scrollclass?: string;
  children?: React.ReactNode;
}

export interface CustomScrollbarsVirtualListProps {
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  forwardedRef?: React.ForwardedRef<unknown>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  stype: ScrollbarType;
}
