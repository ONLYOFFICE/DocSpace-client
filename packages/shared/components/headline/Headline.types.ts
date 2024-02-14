import type { PropsWithChildren } from "react";

export type HeadlineType = "content" | "header" | "menu";

export interface HeadlineProps extends PropsWithChildren {
  id?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  title?: string;
  truncate?: boolean;
  isInline?: boolean;
  type: HeadlineType;
  className?: string;
}

export interface StyledHeadingProps {
  fontSize?: string;
  color?: string;
  headlineType: HeadlineType;
}
