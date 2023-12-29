export interface RowContentProps {
  /** Components displayed inside RowContent */
  children: React.ReactNode[];
  /** Accepts class */
  className?: string;
  /** Disables SideElements */
  disableSideInfo?: boolean;
  /** Accepts id */
  id?: string;
  /** Sets the action initiated upon clicking the button */
  onClick?: () => void;
  /** Changes the side information color */
  sideColor?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Width section */
  sectionWidth?: number;
  /** Converts the SideInfo */
  convertSideInfo?: boolean;
}
