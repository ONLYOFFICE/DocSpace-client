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

import { TViewAs, TTranslation } from "@docspace/shared/types";
import SocketIOHelper from "@docspace/shared/utils/socket";
import { DeviceType } from "@docspace/shared/enums";

export type TUserStatus = "online" | "offline";

export interface ISessions {
  id: number;
  platform: string;
  browser: string;
  ip: string;
  status?: string;
  date?: string;
}

export interface IConnections {
  browser: string;
  city: string | null;
  country: string | null;
  date: string;
  id: number;
  ip: string;
  mobile: boolean;
  page: string;
  platform: string;
  tenantId: number;
  userId: string;
}

export interface IAllSessions {
  avatar: string;
  connections: IConnections[];
  displayName: string;
  id: string;
  isAdmin: boolean;
  isCollaborator: boolean;
  isOwner: boolean;
  isRoomAdmin: boolean;
  isVisitor: boolean;
  sessions: ISessions[];
  status: TUserStatus;
}

export interface IDatafromSocket {
  id: string;
  displayName: string;
  sessions: ISessions;
  status: TUserStatus;
}

export interface SessionsProps {
  allSessions: IAllSessions[];
  displayName: string;
  clearSelection: () => void;
  platformData: ISessions;
  selection: IAllSessions[];
  bufferSelection?: IAllSessions;
  fetchData: () => void;
  isLoading: boolean;
  viewAs: TViewAs;
  setViewAs: (view: string) => void;
  currentDeviceType: DeviceType;
  disableDialogVisible: boolean;
  logoutDialogVisible: boolean;
  logoutAllDialogVisible: boolean;
  setDisableDialogVisible: (visible: boolean) => void;
  setLogoutDialogVisible: (visible: boolean) => void;
  setLogoutAllDialogVisible: (visible: boolean) => void;
  onClickLogoutAllUsers: () => void;
  onClickLogoutAllSessions: () => void;
  onClickLogoutAllExceptThis: () => void;
  onClickRemoveSession: () => void;
  updateUserStatus: () => void;
  getLoginHistoryReport: () => void;
  isLoadingDownloadReport: boolean;
  setUserSessionPanelVisible: (visible: boolean) => void;
  isSeveralSelection: boolean;
  isSessionsLoaded: boolean;
  socketHelper: SocketIOHelper;
}

export interface SessionsTableProps {
  t: TTranslation;
  userId?: string;
  viewAs?: TViewAs;
  sectionWidth: number;
  setSelection?: (selection: unknown) => void;
  setBufferSelection?: (selection: unknown | null) => void;
  sessionsData: IAllSessions[];
}

export interface SessionsTableHeaderProps {
  t: TTranslation;
  userId?: string;
  sectionWidth: number;
  setHideColumns: (visible: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
}

export interface SessionsTableRowProps {
  t: TTranslation;
  item: IAllSessions[];
  element: React.ReactNode;
  sectionWidth?: number;
  onContentRowSelect?: (checked: boolean, item: IAllSessions[]) => void;
  onContentRowClick?: (event: React.MouseEvent, item: IAllSessions[]) => void;
  onUserContextClick?: (item: IAllSessions[], rightClick: boolean) => void;
  isActive?: boolean;
  checkedProps?: { checked: boolean };
  displayName: string;
  hideColumns?: boolean;
  status: string;
  userId: string;
  connections: IConnections[];
  isMe: boolean;
  locale: string;
  setLogoutAllDialogVisible: (visible: boolean) => void;
  setDisableDialogVisible: (visible: boolean) => void;
  setUserSessionPanelVisible: (visible: boolean) => void;
  setItems: (item: IAllSessions[]) => void;
  setDisplayName: (name: string) => void;
  convertDate: (
    t: (key: string) => string,
    date: string,
    locale: string,
  ) => string;
  getFromDateAgo: (userId: string) => string;
  setFromDateAgo: (userId: string, fromDateAgo: string | null) => void;
}

export interface SessionsRowProps {
  t: TTranslation;
  sectionWidth?: number;
  sessionsData: IAllSessions[];
}

export interface SessionsRowContentProps {
  t: TTranslation;
  isOnline: boolean;
  fromDateAgo: string | null;
  displayName: string;
  connections: IConnections[];
  sectionWidth?: number;
}
