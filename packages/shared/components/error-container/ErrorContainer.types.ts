import type { PropsWithChildren } from "react";

export interface ErrorContainerProps extends PropsWithChildren {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  bodyText?: string;
  headerText?: string;
  buttonText?: string;
  isPrimaryButton?: boolean;
  customizedBodyText?: string;

  onClickButton?: VoidFunction;
}
