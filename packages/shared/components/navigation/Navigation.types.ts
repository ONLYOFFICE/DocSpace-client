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
import { TGetContextMenuModel } from "../context-menu";

export type TOnBackToParenFolder = () => void;

export type TTitles = {
  infoPanel?: string;
  actions?: string;
  contextMenu?: string;
  trashWarning?: string;
};

export interface IArrowButtonProps {
  isRootFolder: boolean;
  onBackToParentFolder: TOnBackToParenFolder;
}

export interface IContextButtonProps {
  className: string;
  getData: TGetContextMenuModel;
  withMenu?: boolean;
  isTrashFolder?: boolean;
  isMobile: boolean;
  id: string;
  title?: string;
  onCloseDropBox?: () => void;
  onContextOptionsClick?: () => void;
}

export interface IPlusButtonProps {
  className: string;
  getData: TGetContextMenuModel;
  withMenu?: boolean;
  id?: string;
  title?: string;
  onPlusClick?: () => void;
  isFrame?: boolean;
  onCloseDropBox?: () => void;
}

export interface IToggleInfoPanelButtonProps {
  isRootFolder: boolean;
  isInfoPanelVisible: boolean;
  toggleInfoPanel: (e: React.MouseEvent) => void;
  id?: string;
  titles?: TTitles;
}

export interface IControlButtonProps {
  isRootFolder: boolean;
  canCreate: boolean;
  getContextOptionsFolder: TGetContextMenuModel;
  getContextOptionsPlus: TGetContextMenuModel;
  isEmptyFilesList?: boolean;
  isInfoPanelVisible: boolean;
  toggleInfoPanel: () => void;
  toggleDropBox?: () => void;
  isDesktop: boolean;
  titles?: TTitles;
  withMenu?: boolean;
  onPlusClick?: () => void;
  isFrame?: boolean;
  isPublicRoom?: boolean;
  isTrashFolder?: boolean;
  isMobile?: boolean;
  showTitle?: boolean;
  navigationButtonLabel?: string;
  onNavigationButtonClick?: () => void;
  tariffBar?: React.ReactElement;
  title?: string;
  isEmptyPage?: boolean;
  onCloseDropBox?: () => void;
  onContextOptionsClick?: () => void;
}

export interface ITextProps {
  title: string;
  isOpen: boolean;
  isRootFolder: boolean;
  isRootFolderTitle: boolean;
  onClick: () => void;
  className?: string;
  badgeLabel?: string;
}

export interface INavigationLogoProps {
  logo?: string;
  burgerLogo: string;
  className: string;
  onClick?: () => void;
}

export type TOnNavigationItemClick = (
  id: string | number,
  isRootRoom: boolean,
) => void;

export interface INavigationItemProps {
  id: string | number;
  title: string;
  isRoot: boolean;
  isRootRoom: boolean;
  onClick: TOnNavigationItemClick;
  withLogo: boolean | string;
  currentDeviceType: DeviceType;
  style?: React.CSSProperties;
}

export type TNavigationItem = {
  id: string | number;
  title: string;
  isRootRoom: boolean;
};

export type TRowData = [
  TNavigationItem[],
  TOnNavigationItemClick,
  { withLogo: boolean; currentDeviceType: DeviceType },
];

export interface IDropBoxProps {
  sectionHeight: number;
  dropBoxWidth: number;
  isRootFolder: boolean;
  onBackToParentFolder: TOnBackToParenFolder;
  canCreate: boolean;
  navigationItems: TNavigationItem[];
  getContextOptionsFolder: TGetContextMenuModel;
  getContextOptionsPlus: TGetContextMenuModel;
  toggleInfoPanel: () => void;
  toggleDropBox: () => void;
  onClickAvailable: TOnNavigationItemClick;
  isInfoPanelVisible: boolean;
  isDesktop: boolean;
  isDesktopClient: boolean;
  withLogo: boolean;
  burgerLogo: string;
  currentDeviceType: DeviceType;
  navigationTitleContainerNode: React.ReactNode;
  onCloseDropBox: () => void;
}

export interface INavigationProps {
  tReady: boolean;
  showText: boolean;
  isRootFolder: boolean;
  title: string;
  canCreate: boolean;
  isTabletView: boolean;
  onClickFolder: TOnNavigationItemClick;
  navigationItems: TNavigationItem[];
  onBackToParentFolder: TOnBackToParenFolder;
  getContextOptionsFolder: TGetContextMenuModel;
  getContextOptionsPlus: TGetContextMenuModel;
  isTrashFolder: boolean;
  isEmptyFilesList: boolean;
  clearTrash: () => void;
  showFolderInfo: () => void;
  isCurrentFolderInfo: boolean;
  toggleInfoPanel: () => void;
  isInfoPanelVisible: boolean;
  titles: TTitles;
  withMenu: boolean;
  onPlusClick: () => void;
  isEmptyPage: boolean;
  isDesktop: boolean;
  isRoom: boolean;
  isFrame: boolean;
  hideInfoPanel: () => void;
  withLogo: boolean;
  burgerLogo: string;
  showRootFolderTitle: boolean;
  isPublicRoom: boolean;
  titleIcon: string;
  currentDeviceType: DeviceType;
  rootRoomTitle: string;
  showTitle: boolean;
  navigationButtonLabel?: string;
  onNavigationButtonClick?: () => void;
  tariffBar: React.ReactElement;
  showNavigationButton: boolean;
  titleIconTooltip?: string;
  badgeLabel?: string;
  onContextOptionsClick?: () => void;
  onLogoClick?: () => void;
}
