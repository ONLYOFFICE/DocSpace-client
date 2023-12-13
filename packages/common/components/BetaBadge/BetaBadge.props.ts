import type { PlacesType } from "react-tooltip";
interface BetaBadgeProps {
  documentationEmail?: string;
  currentColorScheme?: any;
  currentDeviceType?: "desktop" | "tablet" | "mobile";

  place: PlacesType;
  mobilePlace?: PlacesType;
  withOutFeedbackLink?: boolean;
}

export default BetaBadgeProps;
