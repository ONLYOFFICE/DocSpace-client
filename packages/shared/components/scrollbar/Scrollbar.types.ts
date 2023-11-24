import { ScrollbarType } from "./Scrollbar.enums";

export interface ScrollbarProps {
  /** Scrollbar style type */
  stype: ScrollbarType;
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

  onScroll?: React.UIEventHandler<HTMLDivElement>;
  scrollClass?: string;
  noScrollY?: boolean;
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
