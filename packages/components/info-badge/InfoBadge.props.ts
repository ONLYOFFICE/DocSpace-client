import type { PlacesType } from "react-tooltip";

interface InfoBadgeProps {
  label: string;
  place: PlacesType;
  tooltipTitle: React.ReactNode;
  tooltipDescription: React.ReactNode;

  offset: number;
}

export default InfoBadgeProps;
