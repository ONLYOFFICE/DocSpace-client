import type { PlacesType } from "react-tooltip";

interface InfoBadgeProps {
  /** badge Label */
  label: string;
  /** Global tooltip placement */
  place: PlacesType;
  /** tooltip header */
  tooltipTitle: React.ReactNode;
  /** tooltip body */
  tooltipDescription: React.ReactNode;
  /** Space between the tooltip element and anchor element (arrow not included in calculation) */
  offset: number;
}

export default InfoBadgeProps;
