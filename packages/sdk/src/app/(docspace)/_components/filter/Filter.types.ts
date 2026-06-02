import type React from "react";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

export type FilterProps = {
  filesFilter: string;

  shareKey?: string;

  showMainButton?: boolean;
  mainButtonProps?: MainButtonProps;
  mainButtonIcon?: React.ReactNode;
};
