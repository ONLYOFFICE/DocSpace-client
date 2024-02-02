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
}

export interface IPlusButtonProps {
  className: string;
  getData: TGetContextMenuModel;
  withMenu?: boolean;
  id?: string;
  title?: string;
  onPlusClick?: () => void;
  isFrame?: boolean;
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
  navigationButtonLabel?: string;
  onNavigationButtonClick?: () => void;
  tariffBar?: React.ReactNode;
  title?: string;
}

export interface ITextProps {
  title: string;
  isOpen: boolean;
  isRootFolder: boolean;
  isRootFolderTitle: boolean;
  onClick: () => void;
  className?: string;
}

export interface INavigationLogoProps {
  logo?: string;
  burgerLogo: string;
  className: string;
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
  navigationButtonLabel?: string;
  onNavigationButtonClick?: () => void;
  tariffBar: React.ReactNode;
}
