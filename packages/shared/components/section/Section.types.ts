import { DeviceType } from "../../enums";
import { TViewAs } from "../../types";

import { FloatingButtonIcons } from "../floating-button";

export interface SubInfoPanelHeaderProps {
  children: React.JSX.Element | null;
}

export interface SubInfoPanelBodyProps {
  children: React.JSX.Element | null;
  isInfoPanelScrollLocked?: boolean;
}

export interface InfoPanelProps {
  children: React.ReactNode;
  isVisible?: boolean;
  isMobileHidden?: boolean;
  setIsVisible?: (value: boolean) => void;
  canDisplay?: boolean;
  anotherDialogOpen?: boolean;
  viewAs?: TViewAs;
  currentDeviceType?: DeviceType;
}

export interface SectionBodyContentProps {
  children: React.ReactNode;
}

export type TOnDrop = (acceptedFiles: File[]) => void;

export interface SectionBodyProps {
  withScroll: boolean;
  autoFocus: boolean;
  onDrop?: TOnDrop;
  uploadFiles?: boolean;
  children: React.ReactNode;
  viewAs?: TViewAs;
  settingsStudio: boolean;
  isFormGallery?: boolean;
  isDesktop?: boolean;
  currentDeviceType?: DeviceType;
}

export interface SectionContainerProps {
  showTwoProgress?: boolean;
  isSectionHeaderAvailable: boolean;
  viewAs?: TViewAs;
  children: React.ReactNode;
}

export interface SectionFilterProps {
  children: React.ReactNode;
  className?: string;
  viewAs?: TViewAs;
}

export interface SectionFooterProps {
  children: React.ReactNode;
}

export interface SectionHeaderProps {
  className: string;
  isFormGallery?: boolean;
  children: React.ReactNode;
}

export interface SectionWarningProps {
  children: React.ReactNode;
}

export interface SectionPagingProps {
  children: React.ReactNode;
}

export interface SectionSubmenuProps {
  children: React.ReactNode;
}

export interface SectionProps {
  children: React.JSX.Element[];
  withBodyScroll?: boolean;
  showPrimaryProgressBar?: boolean;
  primaryProgressBarValue?: number;
  showPrimaryButtonAlert?: boolean;
  progressBarDropDownContent?: React.ReactNode;
  primaryProgressBarIcon?: FloatingButtonIcons;
  showSecondaryProgressBar?: boolean;
  secondaryProgressBarValue?: number;
  secondaryProgressBarIcon?: FloatingButtonIcons;
  showSecondaryButtonAlert?: boolean;
  onDrop?: TOnDrop;
  uploadFiles?: boolean;
  viewAs?: TViewAs;
  onOpenUploadPanel?: () => void;
  isTabletView?: boolean;
  isHeaderVisible?: boolean;
  isInfoPanelAvailable?: boolean;
  settingsStudio?: boolean;
  isEmptyPage?: boolean;
  maintenanceExist?: boolean;
  snackbarExist?: boolean;
  showText?: boolean;
  clearUploadedFilesHistory?: () => void;
  isInfoPanelScrollLocked?: boolean;
  isTrashFolder?: boolean;
  isFormGallery?: boolean;
  currentDeviceType?: DeviceType;
  isInfoPanelVisible?: boolean;
  setIsInfoPanelVisible?: (value: boolean) => void;
  isMobileHidden?: boolean;
  canDisplay?: boolean;
  anotherDialogOpen?: boolean;
  isDesktop?: boolean;
}
