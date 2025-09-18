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

import { makeAutoObservable, toJS } from "mobx";
import { getUserById } from "@docspace/shared/api/people";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { FolderType } from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";
import { getTemplateAvailable } from "@docspace/shared/api/rooms";

import { UserStore } from "@docspace/shared/store/UserStore";
import { TUser } from "@docspace/shared/api/people/types";
import { TLogo, TRoom } from "@docspace/shared/api/rooms/types";
import { Nullable, TCreatedBy } from "@docspace/shared/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { isFolder } from "@docspace/shared/utils/typeGuards";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { getUserType } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";

import config from "PACKAGE_FILE";

import { getContactsView } from "../helpers/contacts";
import SelectedFolderStore from "./SelectedFolderStore";
import FilesSettingsStore from "./FilesSettingsStore";
import FilesStore from "./FilesStore";
import PeopleStore from "./contacts/PeopleStore";
import TreeFoldersStore from "./TreeFoldersStore";

export const enum InfoPanelView {
  infoMembers = "info_members",
  infoHistory = "info_history",
  infoDetails = "info_details",
  infoShare = "info_share",
}

export type InfoPanelViewType = InfoPanelView | `info_plugin-${string}`;

type TSelection =
  | Nullable<TRoom | TFolder | TFile>
  | Array<TRoom | TFolder | TFile>;

class InfoPanelStore {
  userStore = {} as UserStore;

  isVisible = false;

  isMobileHidden = false;

  roomsView: InfoPanelViewType = InfoPanelView.infoMembers;

  fileView: InfoPanelViewType = InfoPanelView.infoHistory;

  isScrollLocked = false;

  filesSettingsStore = {} as FilesSettingsStore;

  peopleStore = {} as PeopleStore;

  filesStore = {} as FilesStore;

  selectedFolderStore = {} as SelectedFolderStore;

  treeFoldersStore = {} as TreeFoldersStore;

  infoPanelRoom: Nullable<TRoom> = null;

  templateAvailableToEveryone = false;

  isMembersPanelUpdating = false;

  shareChanged = false;

  constructor(userStore: UserStore) {
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  setIsVisible = (visiable: boolean) => {
    const selectedFolderIsRoomOrFolderInRoom =
      this.selectedFolderStore &&
      !this.selectedFolderStore.isRootFolder &&
      this.selectedFolderStore?.parentRoomType;

    const archivedFolderIsRoomOrFolderInRoom =
      this.selectedFolderStore &&
      !this.selectedFolderStore.isRootFolder &&
      this.selectedFolderStore?.rootFolderType === FolderType.Archive;

    const isFolderOpenedThroughSectionHeader =
      (this.infoPanelSelection &&
        !Array.isArray(this.infoPanelSelection) &&
        this.infoPanelSelection.id === this.selectedFolderStore?.id) ||
      (this.infoPanelSelection &&
        Array.isArray(this.infoPanelSelection) &&
        this.infoPanelSelection.length === 0);

    if (
      (selectedFolderIsRoomOrFolderInRoom ||
        archivedFolderIsRoomOrFolderInRoom) &&
      isFolderOpenedThroughSectionHeader
    ) {
      this.setView(InfoPanelView.infoMembers);
    } else {
      this.setView(InfoPanelView.infoDetails);
    }

    this.isVisible = visiable;
    this.isScrollLocked = false;
  };

  setTemplateAvailableToEveryone = (isAvailable: boolean) => {
    this.templateAvailableToEveryone = isAvailable;
  };

  setIsMembersPanelUpdating = (isMembersPanelUpdating: boolean) => {
    this.isMembersPanelUpdating = isMembersPanelUpdating;
  };

  updateInfoPanelMembers = async () => {
    if (
      !this.infoPanelRoomSelection ||
      this.roomsView !== InfoPanelView.infoMembers
    ) {
      return;
    }

    const isTemplate =
      "isTemplate" in this.infoPanelRoomSelection &&
      this.infoPanelRoomSelection.isTemplate;

    if (isTemplate) {
      const templateAvailable = await getTemplateAvailable(
        Number(this.infoPanelRoomSelection.id),
      );
      this.setTemplateAvailableToEveryone(templateAvailable);
    }

    this.setIsMembersPanelUpdating(true);
  };

  openShareTab = () => {
    this.setView(InfoPanelView.infoShare);
    this.isVisible = true;
  };

  openMembersTab = () => {
    this.setView(InfoPanelView.infoMembers);
    this.isVisible = true;
  };

  setInfoPanelRoom = (infoPanelRoom: Nullable<TRoom>, withCheck?: boolean) => {
    if (withCheck && infoPanelRoom?.id !== this.infoPanelRoom?.id) return;

    this.infoPanelRoom = infoPanelRoom;
  };

  openUser = async (user: TCreatedBy) => {
    if (user.id === this.userStore?.user?.id) {
      this.peopleStore.profileActionsStore.onProfileClick();
      return;
    }

    const fetchedUser: TUser = await getUserById(user.id);

    const path = [
      window.ClientConfig?.proxy?.url,
      config.homepage,
      fetchedUser.isVisitor ? "/accounts/guests" : "/accounts/people",
    ];

    const filter = Filter.getDefault();
    filter.page = 0;
    filter.search = fetchedUser.email;
    filter.selectUserId = fetchedUser.id;

    path.push(`filter?${filter.toUrlParams()}`);

    this.selectedFolderStore.setSelectedFolder(null);
    this.treeFoldersStore.setSelectedNode(["accounts"]);
    this.filesStore.resetSelections();

    const locale = getCookie(LANGUAGE) || "en";

    fetchedUser.registrationDate = getCorrectDate(
      locale,
      fetchedUser?.registrationDate || "",
    );

    const userRole = { role: getUserType(fetchedUser) };
    const stateUserItem = { ...fetchedUser, ...userRole };

    window.DocSpace.navigate(combineUrl(...path), {
      state: { user: toJS(stateUserItem) },
    });
  };

  getInfoPanelItemIcon = (
    item: TSelection,
    size: number,
  ): TLogo | string | undefined => {
    if (!item) return undefined;

    const isRoom = "isRoom" in item && item.isRoom;
    const roomType = "roomType" in item && item.roomType;

    const folderType = "type" in item && item.type;

    if ((isRoom || roomType) && "logo" in item)
      return item.logo?.cover ? item.logo : item.logo?.medium;

    if (isFolder(item))
      return this.filesSettingsStore.getIconByFolderType(folderType, size);

    const fileExst = "fileExst" in item && item.fileExst;

    return this.filesSettingsStore.getIcon(size, fileExst || ".file");
  };

  get infoPanelSelection(): TSelection {
    const selection = this.filesStore.selection.length
      ? this.filesStore.selection.length === 1
        ? this.filesStore.selection[0]
        : this.filesStore.selection
      : (this.filesStore.bufferSelection ?? { ...this.selectedFolderStore });

    if (!selection) return null;

    if (Array.isArray(selection) && selection.length > 1) {
      return selection;
    }

    const icon = this.getInfoPanelItemIcon(selection, 32);

    return { ...selection, icon };
  }

  get infoPanelRoomSelection(): Nullable<TRoom> {
    if (
      this.infoPanelSelection &&
      !Array.isArray(this.infoPanelSelection) &&
      "isRoom" in this.infoPanelSelection &&
      this.infoPanelSelection.isRoom
    ) {
      return this.infoPanelSelection;
    }

    return this.infoPanelRoom;
  }

  get historyWithFileList(): boolean {
    if (Array.isArray(this.infoPanelSelection) || !this.infoPanelSelection)
      return false;

    return (
      (("isRoom" in this.infoPanelSelection &&
        (this.infoPanelSelection.isRoom as boolean)) ||
        ("isFolder" in this.infoPanelSelection &&
          this.infoPanelSelection.isFolder)) ??
      false
    );
  }

  // Setters

  setIsMobileHidden = (mobileHidden: boolean) => {
    this.isMobileHidden = mobileHidden;
  };

  resetView = () => {
    this.roomsView = InfoPanelView.infoMembers;
    this.fileView = InfoPanelView.infoHistory;
  };

  setView = (view: InfoPanelViewType) => {
    this.roomsView =
      view === InfoPanelView.infoShare ? InfoPanelView.infoMembers : view;
    this.fileView =
      view === InfoPanelView.infoMembers ? InfoPanelView.infoShare : view;
    this.isScrollLocked = false;
  };

  setIsScrollLocked = (isScrollLocked: boolean) => {
    this.isScrollLocked = isScrollLocked;
  };

  // Routing helpers //

  getCanDisplay = () => {
    const isFiles = this.getIsFiles();
    const isRooms = this.getIsRooms();
    const isAccounts =
      this.peopleStore.usersStore.contactsTab !== false ||
      getContactsView(window.location) !== false;
    const isGallery = window.location.pathname.includes("form-gallery");

    return isRooms || isFiles || isGallery || isAccounts;
  };

  getIsFiles = () => {
    const pathname = window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("files") !== -1 ||
      pathname.indexOf("personal") !== -1 ||
      pathname.indexOf("media") !== -1 ||
      pathname.indexOf("recent") !== -1
    );
  };

  getIsRooms = () => {
    const pathname = window.location.pathname.toLowerCase();
    return (
      pathname.indexOf("rooms") !== -1 && !(pathname.indexOf("personal") !== -1)
    );
  };

  getIsTrash = (givenPathName?: string) => {
    const pathname = givenPathName || window.location.pathname.toLowerCase();
    return pathname.indexOf("files/trash") !== -1;
  };

  // getPrimaryFileLink = async (file: TFile) => {
  //   if (!isFile(file)) return;

  //   const { getFileInfo } = this.filesStore;

  //   const res = ShareLinkService.getFilePrimaryLink(file);

  //   await getFileInfo(file.id);

  //   return res;
  // };

  // getPrimaryFolderLink = async (folder: TFolder) => {
  //   if (!isFolder(folder)) return;

  //   return ShareLinkService.getFolderPrimaryLink(folder);
  // };

  setShareChanged = (shareChanged: boolean) => {
    this.shareChanged = shareChanged;
  };
}

export default InfoPanelStore;
