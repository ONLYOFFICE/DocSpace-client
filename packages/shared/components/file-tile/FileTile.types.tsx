import { ReactElement } from "react";

export interface FileTileProps {
  checked?: boolean;
  children?: ReactElement | ReactElement[];
  contextButtonSpacerWidth?: number;
  contextOptions?: Array<any>;
  dragging?: boolean;
  inProgress?: boolean;
  isActive?: boolean;
  item: {
    isPlugin?: boolean;
    fileTileIcon?: string;
  };
  onSelect?: (isSelected: boolean, item: any) => void;
  setSelection?: (checked: boolean) => void;
  sideColor?: string;
  temporaryIcon?: string;
  thumbnail?: string;
  thumbnailClick?: (e: React.MouseEvent) => void;
  withCtrlSelect?: (item: any) => void;
  withShiftSelect?: (item: any) => void;
  element?: ReactElement;
  tileContextClick?: () => void;
}
