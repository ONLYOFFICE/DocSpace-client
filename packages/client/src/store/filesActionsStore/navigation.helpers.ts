/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  FileStatus,
  FolderType,
  RoomsType,
  RoomSearchArea,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isDesktop, isLockedSharedRoom } from "@docspace/shared/utils";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  isFile as isFileCheck,
  isFolder as isFolderCheck,
} from "@docspace/shared/utils/typeGuards";
import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ROOM_DOCUMENTS,
} from "@docspace/shared/utils/filterConstants";
import {
  getCategoryTypeByFolderTypeInSection,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { getSectionTrashTarget } from "SRC_DIR/helpers/articleNavigation";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import UsersFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import {
  frameCallEvent,
  getObjectByLocation,
  getCategoryType,
} from "@docspace/shared/utils/common";
import FilesFilter from "@docspace/shared/api/files/filter";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import { createFolderNavigation } from "SRC_DIR/helpers/createFolderNavigation";
import { hideInfoPanel } from "SRC_DIR/helpers/info-panel";
import { CategoryType } from "@docspace/shared/constants";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import { SECTION_ROOT_FOLDER_TYPES } from "./helpers";
import type FilesActionStore from "../FilesActionsStore";
import type {
  TActionItem,
  TCategoryType,
  TPluginFileItem,
} from "../FilesActionsStore";

export const moveToRoomsPageImpl = (
self: FilesActionStore
)=> {
  const categoryType = getCategoryType(
    window.DocSpace.location,
  ) as TCategoryType;

  const filter = RoomsFilter.getDefault();

  const correctCategoryType =
    categoryType === CategoryType.SharedRoom ||
    categoryType === CategoryType.Chat
      ? CategoryType.Shared
      : categoryType === CategoryType.Form
        ? CategoryType.Forms
        : CategoryType.ArchivedRoom === categoryType
          ? CategoryType.Archive
          : categoryType;

  const path = getCategoryUrl(correctCategoryType);

  const state = {
    title:
      (self.selectedFolderStore?.navigationPath &&
        self.selectedFolderStore?.navigationPath.length > 0 &&
        self.selectedFolderStore?.navigationPath[
          self.selectedFolderStore.navigationPath.length - 1
        ]?.title) ||
      "",
    isRoot: true,
    rootFolderType: self.selectedFolderStore.rootFolderType,
  };

  if ((categoryType as TCategoryType) == CategoryType.Archive) {
    filter.searchArea = RoomSearchArea.Archive;
  }

  if (correctCategoryType === CategoryType.Forms) {
    filter.searchArea = RoomSearchArea.Forms;
  }

  if (
    self.selectedFolderStore?.navigationPath &&
    self.selectedFolderStore?.navigationPath.length > 0 &&
    self.selectedFolderStore?.navigationPath[
      self.selectedFolderStore.navigationPath.length - 1
    ]?.isTemplatesFolder
  ) {
    filter.searchArea =
      correctCategoryType === CategoryType.Forms
        ? RoomSearchArea.FormTemplates
        : RoomSearchArea.Templates;
  }

  if (categoryType === CategoryType.Chat) {
    self.clientLoadingStore.setIsSectionBodyLoading(true, false);
  }

  window.DocSpace.navigate(
    `${path}?${filter.toUrlParams(self.userStore?.user?.id, true)}`,
    {
      state,
      replace: true,
    },
  );
};


export const moveToAIAgentsPageImpl = (
self: FilesActionStore
)=> {
  const categoryType = getCategoryType(window.DocSpace.location);

  const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AIAgents);

  const path = getCategoryUrl(CategoryType.AIAgents);

  const state = {
    title:
      (self.selectedFolderStore?.navigationPath &&
        self.selectedFolderStore?.navigationPath.length > 0 &&
        self.selectedFolderStore?.navigationPath[
          self.selectedFolderStore.navigationPath.length - 1
        ]?.title) ||
      "",
    isRoot: true,
    isPublicRoomType: false,
    rootFolderType: self.selectedFolderStore.rootFolderType,
  };

  if (categoryType === CategoryType.Chat) {
    self.clientLoadingStore.setIsSectionBodyLoading(true, false);
  }

  window.DocSpace.navigate(
    `${path}?${filter.toUrlParams(self.userStore?.user?.id, true)}`,
    {
      state,
      replace: true,
    },
  );
};


export const moveToPublicRoomImpl = (
self: FilesActionStore,folderId?: number | string
)=> {
  const { navigationPath, rootFolderType } = self.selectedFolderStore;
  const { publicRoomKey } = self.publicRoomStore;

  const id = folderId || self.selectedFolderStore.parentId;
  const path = getCategoryUrl(CategoryType.PublicRoom);
  const filter = FilesFilter.getDefault();
  filter.folder = id as string;

  const state = {
    title: navigationPath[0]?.title || "",
    isRoot: navigationPath.length === 1,
    rootFolderType,
  };

  window.DocSpace.navigate(
    `${path}?key=${publicRoomKey}&${filter.toUrlParams()}`,
    { state },
  );
};


export const openLocationActionImpl = async (
self: FilesActionStore,item: {
  id: number | string;
  isRoom?: boolean;
  isTemplate?: boolean;
  isAIAgent?: boolean;
  title?: string;
  rootFolderType?: FolderType;
  roomType?: RoomsType;
}
)=> {
  if (self.publicRoomStore.isPublicRoom)
    return self.moveToPublicRoom(item.id);

  const { id, isRoom, isTemplate, isAIAgent, title, rootFolderType, roomType } =
    item;

  const categoryType = isAIAgent
    ? CategoryType.Chat
    : getCategoryTypeByFolderTypeInSection(rootFolderType, id, { roomType });

  const state = { title, rootFolderType, isRoot: false, isRoom };
  const filter = FilesFilter.getDefault();

  // FilesFilter.folder is declared as a string but the old
  // JS assigns raw numeric ids; toUrlParams only serializes it.
  filter.folder = id as string;

  if (!isAIAgent && (isRoom || isTemplate)) {
    if (self.userStore.user?.id) {
      const key =
        categoryType === CategoryType.Archive
          ? `${FILTER_ARCHIVE_DOCUMENTS}=${self.userStore.user?.id}`
          : `${FILTER_ROOM_DOCUMENTS}=${self.userStore.user?.id}`;

      const filterSharedRoomObj = getUserFilter(key);

      filter.sortBy = filterSharedRoomObj.sortBy;
      filter.sortOrder = filterSharedRoomObj.sortOrder;
    }
  }

  const url = getCategoryUrl(categoryType, id);

  window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`, { state });
};


export const checkAndOpenLocationActionImpl = async (
self: FilesActionStore,
  item: Partial<Omit<TActionItem, "id">> & { id?: number | string },

)=> {
  const {
    myRoomsId,
    myFolderId,
    archiveRoomsId,
    recycleBinFolderId,
    sharedWithMeFolderId,
  } = self.treeFoldersStore;
  const { setIsSectionBodyLoading } = self.clientLoadingStore;
  const { rootFolderType } = self.selectedFolderStore;

  const setIsLoading = (param: boolean) => {
    setIsSectionBodyLoading(param);
  };

  const { title, fileExst, rootFolderType: rootFolderTypeItem } = item;
  const parentId =
    item.parentId || item.toFolderId || item.folderId || recycleBinFolderId;
  const parentTitle = item.parentTitle || item.toFolderTitle;

  const isTrashDestination =
    parentId === recycleBinFolderId || item.parentType === FolderType.TRASH;

  const isRoot = [
    myRoomsId,
    myFolderId,
    archiveRoomsId,
    recycleBinFolderId,
    sharedWithMeFolderId,
  ].includes(parentId);

  const state = {
    title: parentTitle,
    isRoot,
    fileExst,
    highlightFileId: item.id,
    isFileHasExst: !item.fileExst,
    rootFolderType,
  };

  const newFilter = FilesFilter.getDefault();

  // FilesFilter.folder is declared as a string but the old
  // JS assigns raw numeric ids; toUrlParams only serializes it.
  newFilter.search = title as string;
  newFilter.folder = parentId as unknown as string;

  let url;
  if (isTrashDestination) {
    const trashTarget = getSectionTrashTarget(
      window.DocSpace.location.pathname,
    );
    // FilesFilter.folderType is a narrower literal union
    // than the article-navigation targets; the value is only serialized.
    newFilter.folderType =
      trashTarget.folderType as unknown as typeof newFilter.folderType;
    url = trashTarget.path;
  } else {
    const destinationFolderType = SECTION_ROOT_FOLDER_TYPES.includes(
      item.parentType as FolderType,
    )
      ? item.parentType
      : (rootFolderTypeItem ?? rootFolderType);

    const categoryType: TCategoryType = getCategoryTypeByFolderTypeInSection(
      destinationFolderType,
      parentId,
      { pathname: window.DocSpace.location.pathname },
    );

    url = getCategoryUrl(categoryType, parentId);
  }

  setIsLoading(
    window.DocSpace.location.search !== `?${newFilter.toUrlParams()}` ||
      url !== window.DocSpace.location.pathname,
  );

  if (!isDesktop()) hideInfoPanel();

  window.DocSpace.navigate(`${url}?${newFilter.toUrlParams()}`, { state });
};


export const closeMediaViewerAndRestoreUrlImpl = async (
self: FilesActionStore
)=> {
  const { getFirstUrl, setMediaViewerData } = self.mediaViewerDataStore;

  setMediaViewerData({ visible: false, id: null });

  try {
    const url = await getFirstUrl();
    if (!url) return;
    window.history.pushState("", "", url);
  } catch (error) {
    console.error(error);
  }
};


export const onClickBackImpl = (
self: FilesActionStore,fromHotkeys = true
)=> {
  const { roomType } = self.selectedFolderStore;
  const { setSelectedNode } = self.treeFoldersStore;
  const { clearFiles, setBufferSelection, setSelection } = self.filesStore;
  // groupsStore is created in the PeopleStore constructor
  // but typed as nullable; the old JS destructured it unchecked.
  const { insideGroupBackUrl } = self.peopleStore.groupsStore!;
  const { isLoading, setIsSectionBodyLoading } = self.clientLoadingStore;
  if (isLoading) return;

  if (self.mediaViewerDataStore.visible) {
    return self.closeMediaViewerAndRestoreUrl();
  }

  setBufferSelection(null);
  setSelection([]);

  const categoryType = getCategoryType(window.DocSpace.location);

  const isRoom = !!roomType;

  const urlFilter = getObjectByLocation(
    window.DocSpace.location as unknown as Parameters<
      typeof getObjectByLocation
    >[0],
  );

  const isArchivedRoom = !!(
    CategoryType.Trash !== (categoryType as TCategoryType) && urlFilter?.folder
  );

  if (
    roomType === RoomsType.AIRoom ||
    categoryType === CategoryType.Chat ||
    categoryType === CategoryType.AIAgent ||
    categoryType === CategoryType.AIAgents
  ) {
    return self.moveToAIAgentsPage();
  }

  if (self.publicRoomStore.isPublicRoom) {
    return self.backToParentFolder();
  }

  if (
    categoryType === CategoryType.SharedRoom ||
    categoryType === CategoryType.Form ||
    isArchivedRoom
  ) {
    if (isRoom) {
      return self.moveToRoomsPage();
    }

    return self.backToParentFolder();
  }

  if (
    categoryType === CategoryType.Shared ||
    categoryType === CategoryType.Archive
  ) {
    return self.moveToRoomsPage();
  }

  if (categoryType === CategoryType.Trash) {
    return;
  }

  if (categoryType === CategoryType.Personal) {
    return self.backToParentFolder();
  }

  if (categoryType === CategoryType.Settings) {
    clearFiles();

    const path = getCategoryUrl(CategoryType.Settings);

    setSelectedNode(["common"]);

    return window.DocSpace.navigate(path, { replace: true });
  }

  if (categoryType === CategoryType.Accounts) {
    const contactsTab = getContactsView();

    if (insideGroupBackUrl) {
      setIsSectionBodyLoading(true, false);

      window.DocSpace.navigate(insideGroupBackUrl);

      return;
    }

    const filter =
      contactsTab === "groups"
        ? GroupsFilter.getDefault()
        : UsersFilter.getDefault();
    const params = filter.toUrlParams();
    const path = getCategoryUrl(CategoryType.Accounts);

    clearFiles();

    if (window.location.search.includes("group")) {
      setIsSectionBodyLoading(true, false);

      setSelectedNode(["accounts", "groups", "filter"]);

      return window.DocSpace.navigate(`accounts/groups/filter?${params}`, {
        replace: true,
      });
    }

    setSelectedNode(["accounts", "people", "filter"]);

    if (fromHotkeys) return;
    return window.DocSpace.navigate(`${path}?${params}`, { replace: true });
  }
};


export const backToParentFolderImpl = async (
self: FilesActionStore
)=> {
  if (self.publicRoomStore.isPublicRoom) return self.moveToPublicRoom();

  const id = self.selectedFolderStore.parentId;

  const { navigationPath, rootFolderType } = self.selectedFolderStore;

  const filter = FilesFilter.getDefault();

  const filterObj = FilesFilter.getFilter(window.location);

  filter.sortBy = filterObj.sortBy;
  filter.sortOrder = filterObj.sortOrder;

  filter.folder = id as unknown as string;

  const categoryType = getCategoryType(window.DocSpace.location);
  const path = getCategoryUrl(categoryType, id);

  const isRoot = navigationPath.length === 1;

  const state = {
    title: (navigationPath && navigationPath[0]?.title) || "",
    isRoom: navigationPath[0]?.isRoom,
    isRoot,
    rootFolderType,
    isPublicRoomType: navigationPath[0]?.isRoom
      ? navigationPath[0]?.roomType === RoomsType.PublicRoom
      : false,
    rootRoomTitle: "",
  };

  window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, {
    state,
    replace: true,
  });
};


export const openFileActionImpl = async (
self: FilesActionStore,
  item: TActionItem,
  t: TTranslation,
  e?: Parameters<typeof openingNewTab>[1],

)=> {
  if (
    item.external &&
    (item.isLinkExpired || (await self.isExpiredLinkAsync(item, true)))
  ) {
    const isFile = isFileCheck(item);
    const isFolder = isFolderCheck(item);

    const description = isFile
      ? t("Common:FileLinkExpired")
      : isFolder
        ? t("Common:FolderLinkExpired")
        : t("Common:RoomLinkExpired");

    const title = isFile
      ? t("Common:FileNotAvailable")
      : isFolder
        ? t("Common:FolderNotAvailable")
        : t("Common:RoomNotAvailable");

    return toastr.error(description, title);
  }

  if (isLockedSharedRoom(item as unknown as TRoom))
    return self.dialogsStore.setPasswordEntryDialog(
      true,
      item as unknown as TRoom,
    );

  self.openItemAction(item, t, e);
};


export const openItemActionImpl = async (
self: FilesActionStore,
  item: TActionItem,
  // NewFilesBadge/history callers invoke this with the item
  // only; the old JS crashed on t() in the restricted-download branch.
  t?: TTranslation,
  e?: Parameters<typeof openingNewTab>[1],

)=> {
  const { openDocEditor, setSelection, categoryType } = self.filesStore;
  const { currentDeviceType, frameConfig, isFrame } = self.settingsStore;
  const { fileItemsList } = self.pluginStore;
  const { enablePlugins } = self.settingsStore;

  const { isLoading, setIsSectionBodyLoading } = self.clientLoadingStore;
  const { isRecycleBinFolder } = self.treeFoldersStore;
  const { setMediaViewerData, getUrl } = self.mediaViewerDataStore;
  const { setConvertDialogVisible, setConvertItem, setConvertDialogData } =
    self.dialogsStore;

  const { roomType, title: currentTitle } = self.selectedFolderStore;

  if (self.publicRoomStore.isPublicRoom && item.isFolder) {
    setSelection([]);
    return self.moveToPublicRoom(item.id);
  }

  const setIsLoading = (param: boolean) => {
    setIsSectionBodyLoading(param);
  };

  const isMediaOrImage =
    item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
  const canConvert =
    item.viewAccessibility?.MustConvert && item.security?.Convert;
  const canWebEdit = item.viewAccessibility?.WebEdit;
  const canViewedDocs = item.viewAccessibility?.WebView;

  const { id, viewUrl, fileStatus, isFolder, webUrl, isRoom } = item;
  if (isRecycleBinFolder || isLoading) return;

  if (isFolder || isRoom) {
    const { url, state } = await createFolderNavigation(
      item,
      categoryType,
      self.userStore.user?.id,
      roomType,
      currentTitle,
    );

    if (openingNewTab(url, e)) return;

    setIsLoading(true);
    setSelection([]);

    window.DocSpace.navigate(url, { state });
  } else {
    if (isFrame && frameConfig?.events?.onFileManagerClick) {
      frameCallEvent({ event: "onFileManagerClick", data: item });
      return;
    }

    // an encrypted file stays on the normal open path: the plugin registered
    // for this extension could only pass ciphertext outside the room
    if (!isAIAgents() && fileItemsList && enablePlugins && !item.encrypted) {
      // TS cannot track the assignment inside the forEach
      // callback; the erased casts keep the old unchecked reads.
      let currPluginItem: Nullable<TPluginFileItem> = null;

      fileItemsList.forEach((i) => {
        if (i.key === item.fileExst) currPluginItem = i.value;
      });

      if (currPluginItem) {
        const correctDevice = (currPluginItem as TPluginFileItem).devices
          ? (
              (currPluginItem as TPluginFileItem).devices as unknown as string[]
            ).includes(currentDeviceType)
          : true;
        if (correctDevice)
          return (currPluginItem as TPluginFileItem).onClick(
            item as unknown as TFile,
          );
      }
    }

    // Conversion runs on the server, which only ever sees ciphertext for a
    // private room, so neither the converter nor the editor can open such a
    // file. Say that instead of failing later with a generic error.
    if (item.encrypted && item.viewAccessibility?.MustConvert) {
      toastr.info(t!("Common:PrivateRoomConvertNotSupported"));
      return;
    }

    if (canConvert) {
      setConvertItem({ ...item, isOpen: true });
      setConvertDialogData({
        files: item,
      });
      setConvertDialogVisible(true);
      return;
    }

    if (((fileStatus as number) & FileStatus.IsNew) === FileStatus.IsNew)
      await self.onMarkAsRead(item);

    if (canWebEdit || canViewedDocs) {
      let shareKey = item.requestToken;

      if (webUrl) {
        const shareWebUrl = new URL(webUrl);
        // getObjectByLocation expects a router Location but
        // only reads `.search`, which URL also provides (old JS behavior).
        shareKey = getObjectByLocation(
          shareWebUrl as unknown as Parameters<typeof getObjectByLocation>[0],
        )?.share as string | undefined;
      }

      const isPDF = item.fileExst === ".pdf";

      const { isPersonalRoom } = self.treeFoldersStore;

      const canEditForm = isPersonalRoom
        ? item.isPDFForm
        : isPDF &&
          item.isPDFForm &&
          item.security?.EditForm &&
          !item.startFilling;

      return openDocEditor(id, false, shareKey, canEditForm);
    }

    if (isMediaOrImage) {
      setMediaViewerData({ visible: true, id });

      const url = getUrl(id);

      window.history.pushState("", "", url);

      return;
    }

    if (!item.security!.Download) {
      toastr.error(t!("Files:FileDownloadingIsRestricted"));
      return;
    }

    if (item.encrypted) {
      return self.downloadEncryptedFile(item).catch((err) =>
        toastr.error(err as string),
      );
    }

    return window.open(viewUrl, "_self");
  }
};

