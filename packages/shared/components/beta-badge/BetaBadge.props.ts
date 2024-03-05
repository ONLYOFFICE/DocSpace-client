import type { PlacesType } from "react-tooltip";
import type { TColorScheme } from "../../themes";

interface BetaBadgeProps {
  forumLink?: string;
  documentationEmail?: string;
  currentColorScheme?: TColorScheme;
  currentDeviceType?: "desktop" | "tablet" | "mobile";

  place: PlacesType;
  mobilePlace?: PlacesType;
  withOutFeedbackLink?: boolean;
}

export default BetaBadgeProps;
