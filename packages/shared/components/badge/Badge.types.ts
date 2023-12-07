import React from "react";

export interface BadgeProps {
  /** Label */
  label?: string | number;
  /** CSS background-color */
  backgroundColor?: string;
  /** CSS color */
  color?: string;
  /** CSS font-size */
  fontSize?: string;
  /** CSS font-weight */
  fontWeight?: number;
  /** CSS border-radius */
  borderRadius?: string;
  /** CSS padding */
  padding?: string;
  /** CSS max-width */
  maxWidth?: string;
  /** CSS line-height */
  lineHeight?: string;
  /** onClick event */
  onClick?: (e: React.MouseEvent) => void;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets hovered state and link effects */
  isHovered?: boolean;
  /** Disables hover styles */
  noHover?: boolean;
  /** Type Badge */
  type?: "high";
  /** Compact badge */
  compact?: boolean;
  /** Border badge */
  border?: string;
  height?: string;
  isVersionBadge?: boolean;
  isMutedBadge?: boolean;
  isPaidBadge?: boolean;
}
