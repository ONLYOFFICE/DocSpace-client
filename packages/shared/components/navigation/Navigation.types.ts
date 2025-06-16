// (c) Copyright Ascensio System SIA 2009-2025
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

import { RefObject, LegacyRef } from "react";
import { DeviceType } from "../../enums";
import { TGetContextMenuModel } from "../context-menu";

export type TOnBackToParenFolder = () => void;

export type TTitles = {
  infoPanel?: string;
  actions?: string;
  contextMenu?: string;
  warningText?: string;
};

export type TContextButtonProps = {
  className: string;
  getData: TGetContextMenuModel;
  withMenu?: boolean;
  isTrashFolder?: boolean;
  isMobile: boolean;
  id: string;
  title?: string;
  onCloseDropBox?: () => void;
  onContextOptionsClick?: () => void;
  contextButtonAnimation?: (
    setAnimationClasses: (classes: string[]) => void,
  ) => () => void;
  guidAnimationVisible?: boolean;
  setGuidAnimationVisible?: (visible: boolean) => void;
};

export type TPlusButtonProps = {
  className: string;
  getData: TGetContextMenuModel;
  withMenu?: boolean;
  id?: string;
  title?: string;
  onPlusClick?: VoidFunction;
  isFrame?: boolean;
  onCloseDropBox?: () => void;
  forwardedRef?: React.RefObject<HTMLDivElement>;
};

export type TToggleInfoPanelButtonProps = {
  isRootFolder: boolean;
  isInfoPanelVisible: boolean;
  toggleInfoPanel: (e?: React.MouseEvent) => void;
  id?: string;
  titles?: TTitles;
};

export type TArrowButtonProps = {
  isRootFolder: boolean;
  onBackToParentFolder: TOnBackToParenFolder;
};

export type TBadgesProps = {
  titleIcon: string;
  isRootFolder: boolean;
  titleIconTooltip?: string;
};

export type TTextProps = {
  title: string;
  isOpen: boolean;
  isRootFolder: boolean;
  isRootFolderTitle: boolean;
  onClick: () => void;
  className?: string;
  badgeLabel?: string;
};

export type TNavigationLogoProps = {
  logo?: string;
  burgerLogo: string;
  className: string;
  onClick?: () => void;
};

export type TOnNavigationItemClick = (
  id: string | number,
  isRootRoom: boolean,
  isRootTemplates?: boolean,
) => void;

export type TNavigationItemProps = {
  id: string | number;
  title: string;
  isRoot: boolean;
  isRootRoom: boolean;
  onClick: TOnNavigationItemClick;
  withLogo: boolean | string;
  currentDeviceType: DeviceType;
  style?: React.CSSProperties;
  isRootTemplates?: boolean;
};

export type TNavigationItem = {
  id: string | number;
  title: string;
  isRootRoom: boolean;
  isRootTemplates?: boolean;
};

export type TRowParam = {
  withLogo: boolean | string;
  currentDeviceType: DeviceType;
};

export type TRowData = [TNavigationItem[], TOnNavigationItemClick, TRowParam];

export type TControlButtonProps = Omit<TToggleInfoPanelButtonProps, "id"> &
  Omit<TPlusButtonProps, "getData" | "className"> &
  Omit<TContextButtonProps, "getData" | "className" | "id"> & {
    /** Controls visibility of PlusButton */
    canCreate: boolean;
    /** Used in ContextButton for folder options */
    getContextOptionsFolder: TGetContextMenuModel;
    /** Used in PlusButton for plus menu options */
    getContextOptionsPlus: TGetContextMenuModel;
    /** Controls visibility of ContextButton */
    isEmptyFilesList?: boolean;
    /** Used in toggleInfoPanelAction */
    toggleDropBox?: () => void;
    /** Controls visibility of ToggleInfoPanelButton */
    isDesktop: boolean;
    /** Controls visibility of ContextButton */
    isPublicRoom?: boolean;
    /** Used in styled component */
    showTitle?: boolean;
    /** Used for navigation button */
    navigationButtonLabel?: string;
    /** Used for navigation button click handler */
    onNavigationButtonClick?: () => void;
    /** Optional tariff bar element */
    tariffBar?: React.ReactElement;
    /** Controls visibility of TrashWarning */
    isEmptyPage?: boolean;

    isMobile?: boolean;
    /** Used for guidance */
    addButtonRef?: RefObject<HTMLDivElement>;
    buttonRef?: LegacyRef<HTMLButtonElement>;
    isContextButtonVisible?: boolean;
    isPlusButtonVisible?: boolean;
  };

export type TDropBoxProps = TArrowButtonProps &
  Omit<
    TControlButtonProps,
    | "isEmptyPage"
    | "tariffBar"
    | "onNavigationButtonClick"
    | "navigationButtonLabel"
    | "showTitle"
    | "isMobile"
  > &
  TRowParam & {
    sectionHeight: number;
    dropBoxWidth: number;

    navigationItems: TNavigationItem[];
    onClickAvailable: TOnNavigationItemClick;
    isInfoPanelVisible: boolean;
    isDesktopClient: boolean;
    burgerLogo: string;
    navigationTitleContainerNode: React.ReactNode;
    onCloseDropBox: () => void;
  };

export type TNavigationProps = Omit<
  TDropBoxProps,
  | "dropBoxWidth"
  | "sectionHeight"
  | "onCloseDropBox"
  | "onClickAvailable"
  | "isDesktopClient"
  | "isTabletView"
  | "navigationTitleContainerNode"
> &
  Omit<TControlButtonProps, "isMobile"> &
  Omit<
    TTextProps,
    "isOpen" | "title" | "className" | "isRootFolderTitle" | "onClick"
  > & {
    showText: boolean;
    title: string;
    onClickFolder: TOnNavigationItemClick;

    clearTrash: () => void;
    showFolderInfo: () => void;
    isCurrentFolderInfo: boolean;

    isRoom: boolean;
    hideInfoPanel: () => void;
    burgerLogo: string;
    showRootFolderTitle: boolean;
    titleIcon: string;
    rootRoomTitle: string;
    showNavigationButton: boolean;
    titleIconTooltip?: string;
    onLogoClick?: () => void;
  };
