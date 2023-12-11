import type { PlacesType } from "react-tooltip";
interface BetaBadgeProps {
  documentationEmail?: string;
  currentColorScheme?: any;
  currentDeviceType?: "desktop" | "tablet" | "mobile";

  place: PlacesType;
}

export default BetaBadgeProps;
