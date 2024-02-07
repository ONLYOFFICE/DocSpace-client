import React from "react";

export interface PublicRoomBarProps {
  headerText: string;
  bodyText: string;
  iconName?: string;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}
