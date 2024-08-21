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

import { makeAutoObservable } from "mobx";
import { TableVersions } from "SRC_DIR/helpers/constants";

const TABLE_COLUMNS = `filesTableColumns_ver-${TableVersions.Files}`;
const TABLE_ACCOUNTS_PEOPLE_COLUMNS = `peopleTableColumns_ver-${TableVersions.People}`;
const TABLE_ACCOUNTS_GROUPS_COLUMNS = `groupsTableColumns_ver-${TableVersions.Groups}`;
const TABLE_ACCOUNTS_INSIDE_GROUP_COLUMNS = `insideGroupTableColumns_ver-${TableVersions.InsideGroup}`;
const TABLE_ROOMS_COLUMNS = `roomsTableColumns_ver-${TableVersions.Rooms}`;
const TABLE_TRASH_COLUMNS = `trashTableColumns_ver-${TableVersions.Trash}`;
const TABLE_RECENT_COLUMNS = `recentTableColumns_ver-${TableVersions.Recent}`;

const COLUMNS_SIZE = `filesColumnsSize_ver-${TableVersions.Files}`;
const COLUMNS_ROOMS_SIZE = `roomsColumnsSize_ver-${TableVersions.Rooms}`;
const COLUMNS_TRASH_SIZE = `trashColumnsSize_ver-${TableVersions.Trash}`;
const COLUMNS_RECENT_SIZE = `recentColumnsSize_ver-${TableVersions.Recent}`;

const COLUMNS_SIZE_INFO_PANEL = `filesColumnsSizeInfoPanel_ver-${TableVersions.Files}`;
const COLUMNS_ROOMS_SIZE_INFO_PANEL = `roomsColumnsSizeInfoPanel_ver-${TableVersions.Rooms}`;
const COLUMNS_TRASH_SIZE_INFO_PANEL = `trashColumnsSizeInfoPanel_ver-${TableVersions.Trash}`;
const COLUMNS_RECENT_SIZE_INFO_PANEL = `recentColumnsSizeInfoPanel_ver-${TableVersions.Recent}`;

class TableStore {
  authStore;
  treeFoldersStore;
  userStore;
  settingsStore;

  roomColumnNameIsEnabled = true; // always true
  roomColumnTypeIsEnabled = false;
  roomColumnTagsIsEnabled = true;
  roomColumnOwnerIsEnabled = false;
  roomColumnQuickButtonsIsEnabled = true;
  roomColumnActivityIsEnabled = true;
  roomQuotaColumnIsEnable = false;

  nameColumnIsEnabled = true; // always true
  authorColumnIsEnabled = false;
  roomColumnIsEnabled = true;
  erasureColumnIsEnabled = true;
  createdColumnIsEnabled = true;
  modifiedColumnIsEnabled = true;
  sizeColumnIsEnabled = true;
  typeColumnIsEnabled = true;
  quickButtonsColumnIsEnabled = true;
  lastOpenedColumnIsEnabled = true;

  authorTrashColumnIsEnabled = true;
  createdTrashColumnIsEnabled = false;
  sizeTrashColumnIsEnabled = false;
  typeTrashColumnIsEnabled = false;

  typeAccountsColumnIsEnabled = true;
  groupAccountsColumnIsEnabled = true;
  emailAccountsColumnIsEnabled = true;
  storageAccountsColumnIsEnabled = true;

  peopleAccountsGroupsColumnIsEnabled = true;
  managerAccountsGroupsColumnIsEnabled = true;

  typeAccountsInsideGroupColumnIsEnabled = true;
  groupAccountsInsideGroupColumnIsEnabled = true;
  emailAccountsInsideGroupColumnIsEnabled = true;

  constructor(authStore, treeFoldersStore, userStore, settingsStore) {
    makeAutoObservable(this);

    this.authStore = authStore;
    this.treeFoldersStore = treeFoldersStore;
    this.userStore = userStore;
    this.settingsStore = settingsStore;
  }

  setRoomColumnType = (enable) => {
    this.roomColumnTypeIsEnabled = enable;
  };

  setRoomColumnTags = (enable) => {
    this.roomColumnTagsIsEnabled = enable;
  };

  setRoomColumnOwner = (enable) => {
    this.roomColumnOwnerIsEnabled = enable;
  };

  setRoomColumnActivity = (enable) => {
    this.roomColumnActivityIsEnabled = enable;
  };

  setRoomColumnQuota = (enable) => {
    this.roomQuotaColumnIsEnable = enable;
  };

  setAuthorColumn = (enable) => {
    this.authorColumnIsEnabled = enable;
  };

  setCreatedColumn = (enable) => {
    this.createdColumnIsEnabled = enable;
  };

  setModifiedColumn = (enable) => {
    this.modifiedColumnIsEnabled = enable;
  };

  setRoomColumn = (enable) => {
    this.roomColumnIsEnabled = enable;
  };

  setErasureColumn = (enable) => {
    this.erasureColumnIsEnabled = enable;
  };

  setSizeColumn = (enable) => {
    this.sizeColumnIsEnabled = enable;
  };

  setTypeColumn = (enable) => {
    this.typeColumnIsEnabled = enable;
  };

  setQuickButtonsColumn = (enable) => {
    this.quickButtonsColumnIsEnabled = enable;
  };

  setAuthorTrashColumn = (enable) => (this.authorTrashColumnIsEnabled = enable);
  setCreatedTrashColumn = (enable) =>
    (this.createdTrashColumnIsEnabled = enable);
  setSizeTrashColumn = (enable) => (this.sizeTrashColumnIsEnabled = enable);
  setTypeTrashColumn = (enable) => (this.typeTrashColumnIsEnabled = enable);
  setLastOpenedColumn = (enable) => (this.lastOpenedColumnIsEnabled = enable);

  setAccountsColumnType = (enable) =>
    (this.typeAccountsColumnIsEnabled = enable);
  setAccountsColumnEmail = (enable) =>
    (this.emailAccountsColumnIsEnabled = enable);
  setAccountsColumnGroup = (enable) =>
    (this.groupAccountsColumnIsEnabled = enable);
  setAccountsColumnStorage = (enable) =>
    (this.storageAccountsColumnIsEnabled = enable);

  setAccountsGroupsColumnPeople = (enable) =>
    (this.peopleAccountsGroupsColumnIsEnabled = enable);
  setAccountsGroupsColumnManager = (enable) =>
    (this.managerAccountsGroupsColumnIsEnabled = enable);

  setAccountsInsideGroupColumnType = (enable) =>
    (this.typeAccountsInsideGroupColumnIsEnabled = enable);
  setAccountsInsideGroupColumnEmail = (enable) =>
    (this.emailAccountsInsideGroupColumnIsEnabled = enable);
  setAccountsInsideGroupColumnGroup = (enable) =>
    (this.groupAccountsInsideGroupColumnIsEnabled = enable);

  setColumnsEnable = (frameTableColumns) => {
    const storageColumns = localStorage.getItem(this.tableStorageName);
    const splitColumns = storageColumns
      ? storageColumns.split(",")
      : frameTableColumns
        ? frameTableColumns.split(",")
        : null;

    if (splitColumns) {
      const {
        isRoomsFolder,
        isArchiveFolder,
        isTrashFolder,
        getIsAccountsPeople,
        getIsAccountsGroups,
        getIsAccountsInsideGroup,
      } = this.treeFoldersStore;
      const isRooms = isRoomsFolder || isArchiveFolder;

      if (isRooms) {
        this.setRoomColumnType(splitColumns.includes("Type"));
        this.setRoomColumnTags(splitColumns.includes("Tags"));
        this.setRoomColumnOwner(splitColumns.includes("Owner"));
        this.setRoomColumnActivity(splitColumns.includes("Activity"));
        this.setRoomColumnQuota(splitColumns.includes("Storage"));
        return;
      }

      if (getIsAccountsPeople()) {
        this.setAccountsColumnType(splitColumns.includes("Type"));
        this.setAccountsColumnEmail(splitColumns.includes("Mail"));
        this.setAccountsColumnGroup(splitColumns.includes("Department"));
        this.setAccountsColumnStorage(splitColumns.includes("Storage"));
        return;
      }

      if (getIsAccountsGroups()) {
        this.setAccountsGroupsColumnPeople(splitColumns.includes("People"));
        this.setAccountsGroupsColumnManager(
          splitColumns.includes("Head of Group"),
        );
        return;
      }

      if (getIsAccountsInsideGroup()) {
        this.setAccountsInsideGroupColumnType(splitColumns.includes("Type"));
        this.setAccountsInsideGroupColumnEmail(splitColumns.includes("Mail"));
        this.setAccountsInsideGroupColumnGroup(
          splitColumns.includes("Department"),
        );
        return;
      }

      if (isTrashFolder) {
        this.setRoomColumn(splitColumns.includes("Room"));
        this.setAuthorTrashColumn(splitColumns.includes("AuthorTrash"));
        this.setCreatedTrashColumn(splitColumns.includes("CreatedTrash"));
        this.setErasureColumn(splitColumns.includes("Erasure"));
        this.setSizeTrashColumn(splitColumns.includes("SizeTrash"));
        this.setTypeTrashColumn(splitColumns.includes("TypeTrash"));
        this.setQuickButtonsColumn(splitColumns.includes("QuickButtons"));
        return;
      }

      this.setModifiedColumn(splitColumns.includes("Modified"));
      this.setAuthorColumn(splitColumns.includes("Author"));
      this.setCreatedColumn(splitColumns.includes("Created"));
      this.setSizeColumn(splitColumns.includes("Size"));
      this.setTypeColumn(splitColumns.includes("Type"));
      this.setQuickButtonsColumn(splitColumns.includes("QuickButtons"));
      this.setLastOpenedColumn(splitColumns.includes("LastOpened"));
    }
  };

  setColumnEnable = (key) => {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      getIsAccountsPeople,
      getIsAccountsGroups,
      getIsAccountsInsideGroup,
    } = this.treeFoldersStore;
    const isRooms = isRoomsFolder || isArchiveFolder;

    switch (key) {
      case "Room":
        this.setRoomColumn(!this.roomColumnIsEnabled);
        return;

      case "Author":
        this.setAuthorColumn(!this.authorColumnIsEnabled);
        return;
      case "AuthorTrash":
        this.setAuthorTrashColumn(!this.authorTrashColumnIsEnabled);
        return;

      case "Created":
        this.setCreatedColumn(!this.createdColumnIsEnabled);
        return;
      case "CreatedTrash":
        this.setCreatedTrashColumn(!this.createdTrashColumnIsEnabled);
        return;

      case "Department":
        getIsAccountsPeople()
          ? this.setAccountsColumnGroup(!this.groupAccountsColumnIsEnabled)
          : this.setAccountsInsideGroupColumnGroup(
              !this.groupAccountsInsideGroupColumnIsEnabled,
            );
        return;

      case "Modified":
        this.setModifiedColumn(!this.modifiedColumnIsEnabled);
        return;

      case "Erasure":
        this.setErasureColumn(!this.erasureColumnIsEnabled);
        return;

      case "Size":
        this.setSizeColumn(!this.sizeColumnIsEnabled);
        return;
      case "SizeTrash":
        this.setSizeTrashColumn(!this.sizeTrashColumnIsEnabled);
        return;

      case "Type":
        isRooms
          ? this.setRoomColumnType(!this.roomColumnTypeIsEnabled)
          : getIsAccountsPeople()
            ? this.setAccountsColumnType(!this.typeAccountsColumnIsEnabled)
            : getIsAccountsInsideGroup()
              ? this.setAccountsInsideGroupColumnType(
                  !this.typeAccountsInsideGroupColumnIsEnabled,
                )
              : this.setTypeColumn(!this.typeColumnIsEnabled);
        return;

      case "TypeTrash":
        this.setTypeTrashColumn(!this.typeTrashColumnIsEnabled);
        return;

      case "QuickButtons":
        this.setQuickButtonsColumn(!this.quickButtonsColumnIsEnabled);
        return;

      case "Owner":
        this.setRoomColumnOwner(!this.roomColumnOwnerIsEnabled);
        return;

      case "Tags":
        this.setRoomColumnTags(!this.roomColumnTagsIsEnabled);
        return;

      case "Activity":
        this.setRoomColumnActivity(!this.roomColumnActivityIsEnabled);
        return;

      case "LastOpened":
        this.setLastOpenedColumn(!this.lastOpenedColumnIsEnabled);
        return;

      case "Mail":
        getIsAccountsPeople()
          ? this.setAccountsColumnEmail(!this.emailAccountsColumnIsEnabled)
          : this.setAccountsInsideGroupColumnEmail(
              !this.emailAccountsInsideGroupColumnIsEnabled,
            );
        return;

      case "Storage":
        getIsAccountsPeople()
          ? this.setAccountsColumnStorage(!this.storageAccountsColumnIsEnabled)
          : this.setRoomColumnQuota(!this.roomQuotaColumnIsEnable);
        return;

      case "People":
        this.setAccountsGroupsColumnPeople(
          !this.peopleAccountsGroupsColumnIsEnabled,
        );
        return;

      case "Head of Group":
        this.setAccountsGroupsColumnManager(
          !this.managerAccountsGroupsColumnIsEnabled,
        );
        return;

      default:
        return;
    }
  };

  getColumns = (defaultColumns) => {
    const { isFrame, frameConfig } = this.settingsStore;
    const storageColumns = localStorage.getItem(this.tableStorageName);
    const splitColumns = storageColumns && storageColumns.split(",");
    const frameTableColumns = frameConfig?.viewTableColumns;

    const columns = [];

    if (splitColumns) {
      this.setColumnsEnable();

      for (let col of defaultColumns) {
        const column = splitColumns.find((key) => key === col.key);
        column ? (col.enable = true) : (col.enable = false);

        columns.push(col);
      }
      return columns;
    } else if (isFrame && frameTableColumns) {
      this.setColumnsEnable(frameTableColumns);

      const frameTableArray = frameTableColumns.split(",");
      return defaultColumns.map((col) => {
        col.enable = frameTableArray.includes(col.key) ? true : false;
        return col;
      });
    } else {
      return defaultColumns;
    }
  };

  // Column names
  get tableStorageName() {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      getIsAccountsPeople,
      getIsAccountsGroups,
      isRecentTab,
      getIsAccountsInsideGroup,
    } = this.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;

    const tableStorageName = isRooms
      ? `${TABLE_ROOMS_COLUMNS}=${userId}`
      : getIsAccountsPeople()
        ? `${TABLE_ACCOUNTS_PEOPLE_COLUMNS}=${userId}`
        : getIsAccountsGroups()
          ? `${TABLE_ACCOUNTS_GROUPS_COLUMNS}=${userId}`
          : getIsAccountsInsideGroup()
            ? `${TABLE_ACCOUNTS_INSIDE_GROUP_COLUMNS}=${userId}`
            : isTrashFolder
              ? `${TABLE_TRASH_COLUMNS}=${userId}`
              : isRecentTab
                ? `${TABLE_RECENT_COLUMNS}=${userId}`
                : `${TABLE_COLUMNS}=${userId}`;

    return isFrame ? `SDK_${tableStorageName}` : tableStorageName;
  }

  // Table column sizes
  get columnStorageName() {
    const { isRoomsFolder, isArchiveFolder, isTrashFolder, isRecentTab } =
      this.treeFoldersStore;
    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;

    const columnStorageName = isRooms
      ? `${COLUMNS_ROOMS_SIZE}=${userId}`
      : isTrashFolder
        ? `${COLUMNS_TRASH_SIZE}=${userId}`
        : isRecentTab
          ? `${COLUMNS_RECENT_SIZE}=${userId}`
          : `${COLUMNS_SIZE}=${userId}`;

    return isFrame ? `SDK_${columnStorageName}` : columnStorageName;
  }

  // Column names for info-panel
  get columnInfoPanelStorageName() {
    const { isRoomsFolder, isArchiveFolder, isTrashFolder, isRecentTab } =
      this.treeFoldersStore;
    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;

    const columnInfoPanelStorageName = isRooms
      ? `${COLUMNS_ROOMS_SIZE_INFO_PANEL}=${userId}`
      : isTrashFolder
        ? `${COLUMNS_TRASH_SIZE_INFO_PANEL}=${userId}`
        : isRecentTab
          ? `${COLUMNS_RECENT_SIZE_INFO_PANEL}=${userId}`
          : `${COLUMNS_SIZE_INFO_PANEL}=${userId}`;

    return isFrame
      ? `SDK_${columnInfoPanelStorageName}`
      : columnInfoPanelStorageName;
  }

  get filesColumnStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_SIZE}=${userId}`;
  }
  get roomsColumnStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_ROOMS_SIZE}=${userId}`;
  }
  get trashColumnStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_TRASH_SIZE}=${userId}`;
  }

  get filesColumnInfoPanelStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_SIZE_INFO_PANEL}=${userId}`;
  }
  get roomsColumnInfoPanelStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_ROOMS_SIZE_INFO_PANEL}=${userId}`;
  }
  get trashColumnInfoPanelStorageName() {
    const userId = this.userStore.user?.id;
    return `${COLUMNS_TRASH_SIZE_INFO_PANEL}=${userId}`;
  }
}

export default TableStore;
