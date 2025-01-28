// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { DeviceType } from "../../enums";
import { TViewAs } from "../../types";
import { FloatingButtonIcons } from "../floating-button";
import { ContextMenuModel } from "../context-menu";

export type SubInfoPanelHeaderProps = {
  children: React.JSX.Element | null;
};

export type SubInfoPanelBodyProps = {
  children: React.JSX.Element | null;
  isInfoPanelScrollLocked?: boolean;
};

export type InfoPanelProps = {
  children: React.ReactNode;
  isVisible?: boolean;
  isMobileHidden?: boolean;
  setIsVisible?: (value: boolean) => void;
  canDisplay?: boolean;
  anotherDialogOpen?: boolean;
  viewAs?: TViewAs;
  currentDeviceType?: DeviceType;
};

export type SectionBodyContentProps = {
  children: React.ReactNode;
};

export type TOnDrop = (acceptedFiles: File[]) => void;

export type SectionBodyProps = {
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
  getContextModel?: () => ContextMenuModel[];
  pathname?: string;
  isIndexEditingMode?: boolean;
};

export type SectionContainerProps = {
  showTwoProgress?: boolean;
  isSectionHeaderAvailable: boolean;
  isInfoPanelVisible?: boolean;
  viewAs?: TViewAs;
  children: React.ReactNode;
  withBodyScroll: boolean;
  currentDeviceType?: DeviceType;
};

export type SectionFilterProps = {
  children: React.ReactNode;
  className?: string;
  viewAs?: TViewAs;
};

export type SectionFooterProps = {
  children: React.ReactNode;
};

export type SectionHeaderProps = {
  className: string;
  isFormGallery?: boolean;
  children: React.ReactNode;
};

export type SectionWarningProps = {
  children: React.ReactNode;
};

export type SectionSubmenuProps = {
  children: React.ReactNode;
};

export interface Operation {
  operation: string;
  label: string;
  alert: boolean;
  completed: boolean;
  percent?: number;
  items?: Array<{
    operationId: string;
    percent: number;
  }>;
}

export interface OperationsProgressProps {
  primaryActiveOperations?: Operation[];
  secondaryActiveOperations?: Operation[];
  operationsAlert?: boolean;
  operationsCompleted?: boolean;
  clearSecondaryProgressData: (
    operationId: string | null,
    operation: string | null,
    allOperations: boolean,
  ) => void;
  clearPrimaryProgressData: () => void;
  cancelUpload: (t: (key: string) => string) => void;
  onOpenPanel?: () => void;
}

export type SectionProps = Omit<SubInfoPanelHeaderProps, "children"> &
  Omit<SectionSubmenuProps, "children"> &
  Omit<SubInfoPanelBodyProps, "children"> &
  Omit<SectionWarningProps, "children"> &
  Omit<SectionFooterProps, "children"> &
  Omit<SectionFilterProps, "children" | "className"> &
  Omit<InfoPanelProps, "children" | "setIsVisible" | "isVisible"> &
  Omit<SectionHeaderProps, "children" | "className"> &
  Omit<SectionContainerProps, "children" | "isSectionHeaderAvailable"> &
  Omit<
    SectionBodyProps,
    "children" | "isSectionHeaderAvailable" | "autoFocus" | "withScroll"
  > & {
    children: React.JSX.Element[];
    showPrimaryProgressBar?: boolean;
    primaryProgressBarValue?: number;
    showPrimaryButtonAlert?: boolean;
    progressBarDropDownContent?: React.ReactNode;
    primaryProgressBarIcon?: FloatingButtonIcons;
    showSecondaryProgressBar?: boolean;
    secondaryProgressBarValue?: number;
    secondaryProgressBarIcon?: FloatingButtonIcons;
    showSecondaryButtonAlert?: boolean;
    onOpenUploadPanel?: () => void;
    isTabletView?: boolean;
    isHeaderVisible?: boolean;
    isInfoPanelAvailable?: boolean;
    isEmptyPage?: boolean;
    maintenanceExist?: boolean;
    snackbarExist?: boolean;
    showText?: boolean;
    clearUploadedFilesHistory?: () => void;
    isTrashFolder?: boolean;
    setIsInfoPanelVisible?: (value: boolean) => void;
  };

export type SectionContextMenuProps = {
  getContextModel?: () => ContextMenuModel[];
};
