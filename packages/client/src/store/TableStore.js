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

import { makeAutoObservable } from "mobx";
import { TableVersions } from "SRC_DIR/helpers/constants";
import { getContactsView } from "SRC_DIR/helpers/contacts";

const TABLE_COLUMNS = `filesTableColumns_ver-${TableVersions.Files}`;
const TABLE_PEOPLE_COLUMNS = `peopleTableColumns_ver-${TableVersions.People}`;
const TABLE_GUESTS_COLUMNS = `guestsTableColumns_ver-${TableVersions.Guests}`;
const TABLE_GROUPS_COLUMNS = `groupsTableColumns_ver-${TableVersions.Groups}`;
const TABLE_INSIDE_GROUP_COLUMNS = `insideGroupTableColumns_ver-${TableVersions.InsideGroup}`;
const TABLE_ROOMS_COLUMNS = `roomsTableColumns_ver-${TableVersions.Rooms}`;
const TABLE_TRASH_COLUMNS = `trashTableColumns_ver-${TableVersions.Trash}`;
const TABLE_RECENT_COLUMNS = `recentTableColumns_ver-${TableVersions.Recent}`;
const TABLE_VDR_INDEXING_COLUMNS = `vdrIndexingColumns_ver-${TableVersions.Rooms}`;
const TABLE_TEMPLATES_ROOM_COLUMNS = `templatesRoomsTableColumns_ver-${TableVersions.Rooms}`;

const COLUMNS_SIZE = `filesColumnsSize_ver-${TableVersions.Files}`;
const COLUMNS_ROOMS_SIZE = `roomsColumnsSize_ver-${TableVersions.Rooms}`;
const COLUMNS_TRASH_SIZE = `trashColumnsSize_ver-${TableVersions.Trash}`;
const COLUMNS_RECENT_SIZE = `recentColumnsSize_ver-${TableVersions.Recent}`;
const COLUMNS_VDR_INDEXING_SIZE = `vdrIndexingColumnsSize_ver-${TableVersions.Rooms}`;
const COLUMNS_PEOPLE_SIZE = `peopleColumnsSize_ver-${TableVersions.People}`;
const COLUMNS_GUESTS_SIZE = `guestsColumnsSize_ver-${TableVersions.Guests}`;
const COLUMNS_GROUPS_SIZE = `groupsColumnsSize_ver-${TableVersions.Groups}`;
const COLUMNS_INSIDE_GROUPS_SIZE = `insideGroupColumnsSize_ver-${TableVersions.InsideGroup}`;
const COLUMNS_TEMPLATES_ROOM_SIZE = `templatesRoomsColumnsSize_ver-${TableVersions.Rooms}`;

const COLUMNS_SIZE_INFO_PANEL = `filesColumnsSizeInfoPanel_ver-${TableVersions.Files}`;
const COLUMNS_ROOMS_SIZE_INFO_PANEL = `roomsColumnsSizeInfoPanel_ver-${TableVersions.Rooms}`;
const COLUMNS_TRASH_SIZE_INFO_PANEL = `trashColumnsSizeInfoPanel_ver-${TableVersions.Trash}`;
const COLUMNS_RECENT_SIZE_INFO_PANEL = `recentColumnsSizeInfoPanel_ver-${TableVersions.Recent}`;
const COLUMNS_VDR_INDEXING_SIZE_INFO_PANEL = `vdrIndexingColumnsSizeInfoPanel_ver-${TableVersions.Rooms}`;
const COLUMNS_PEOPLE_INFO_PANEL_SIZE = `infoPanelPeopleColumnsSize_ver-${TableVersions.People}`;
const COLUMNS_GUESTS_INFO_PANEL_SIZE = `infoPanelGuestsColumnsSize_ver-${TableVersions.Guests}`;
const COLUMNS_GROUPS_INFO_PANEL_SIZE = `infoPanelGuestsColumnsSize_ver-${TableVersions.Groups}`;
const COLUMNS_INSIDE_GROUPS_INFO_PANEL_SIZE = `infoPanelInsideGroupPeopleColumnsSize_ver-${TableVersions.InsideGroup}`;
const COLUMNS_TEMPLATES_ROOM_SIZE_INFO_PANEL = `templatesRoomsColumnsSizeInfoPanel_ver-${TableVersions.Rooms}`;

class TableStore {
  authStore;

  treeFoldersStore;

  userStore;

  settingsStore;

  selectedFolderStore;

  peopleStore;

  roomColumnNameIsEnabled = true; // always true

  roomColumnTypeIsEnabled = false;

  roomColumnTagsIsEnabled = true;

  roomColumnOwnerIsEnabled = false;

  roomColumnActivityIsEnabled = true;

  roomQuotaColumnIsEnable = false;

  nameColumnIsEnabled = true; // always true

  authorColumnIsEnabled = false;

  roomColumnIsEnabled = true;

  erasureColumnIsEnabled = true;

  createdColumnIsEnabled = false;

  modifiedColumnIsEnabled = true;

  sizeColumnIsEnabled = true;

  typeColumnIsEnabled = false;

  authorRecentColumnIsEnabled = true;

  modifiedRecentColumnIsEnabled = false;

  createdRecentColumnIsEnabled = false;

  sizeRecentColumnIsEnabled = true;

  typeRecentColumnIsEnabled = false;

  lastOpenedColumnIsEnabled = true;

  authorTrashColumnIsEnabled = true;

  createdTrashColumnIsEnabled = false;

  sizeTrashColumnIsEnabled = true;

  typeTrashColumnIsEnabled = false;

  peopleGroupsColumnIsEnabled = true;

  managerGroupsColumnIsEnabled = true;

  typePeopleColumnIsEnabled = true;

  groupPeopleColumnIsEnabled = true;

  emailPeopleColumnIsEnabled = true;

  storagePeopleColumnIsEnabled = true;

  inviterGuestsColumnIsEnabled = true;

  emailGuestsColumnIsEnabled = true;

  invitedDateGuestsColumnIsEnabled = true;

  typeInsideGroupColumnIsEnabled = true;

  groupInsideGroupColumnIsEnabled = true;

  emailInsideGroupColumnIsEnabled = true;

  storageInsideGroupColumnIsEnabled = true;

  indexVDRColumnIsEnabled = true; // always true

  authorVDRColumnIsEnabled = true;

  modifiedVDRColumnIsEnabled = true;

  createdVDRColumnIsEnabled = false;

  sizeVDRColumnIsEnabled = true;

  typeVDRColumnIsEnabled = false;

  templatesRoomColumnTypeIsEnabled = true;

  templatesRoomColumnOwnerIsEnabled = true;

  templateRoomColumnTagsIsEnabled = true;

  templateRoomColumnActivityIsEnabled = true;

  templateRoomQuotaColumnIsEnable = false;

  constructor(
    authStore,
    treeFoldersStore,
    userStore,
    settingsStore,
    indexingStore,
    selectedFolderStore,
    peopleStore,
  ) {
    makeAutoObservable(this);

    this.authStore = authStore;
    this.treeFoldersStore = treeFoldersStore;
    this.userStore = userStore;
    this.settingsStore = settingsStore;
    this.indexingStore = indexingStore;
    this.selectedFolderStore = selectedFolderStore;
    this.peopleStore = peopleStore;
  }

  setRoomColumnType = (enable) => {
    this.roomColumnTypeIsEnabled = enable;
  };

  setRoomColumnTags = (enable) => {
    this.roomColumnTagsIsEnabled = enable;
  };

  setTemplateRoomColumnTags = (enable) => {
    this.templateRoomColumnTagsIsEnabled = enable;
  };

  setRoomColumnOwner = (enable) => {
    this.roomColumnOwnerIsEnabled = enable;
  };

  setRoomColumnActivity = (enable) => {
    this.roomColumnActivityIsEnabled = enable;
  };

  setTemplateRoomColumnActivity = (enable) => {
    this.templateRoomColumnActivityIsEnabled = enable;
  };

  setRoomColumnQuota = (enable) => {
    this.roomQuotaColumnIsEnable = enable;
  };

  setTemplateRoomColumnQuota = (enable) => {
    this.templateRoomQuotaColumnIsEnable = enable;
  };

  setAuthorColumn = (enable) => {
    this.authorColumnIsEnabled = enable;
  };

  setAuthorRecentColumn = (enable) => {
    this.authorRecentColumnIsEnabled = enable;
  };

  setAuthorVDRColumn = (enable) => {
    this.authorVDRColumnIsEnabled = enable;
  };

  setOwnerTemplatesColumn = (enable) => {
    this.templatesRoomColumnOwnerIsEnabled = enable;
  };

  setCreatedColumn = (enable) => {
    this.createdColumnIsEnabled = enable;
  };

  setCreatedRecentColumn = (enable) => {
    this.createdRecentColumnIsEnabled = enable;
  };

  setCreatedVDRColumn = (enable) => {
    this.createdVDRColumnIsEnabled = enable;
  };

  setModifiedColumn = (enable) => {
    this.modifiedColumnIsEnabled = enable;
  };

  setModifiedRecentColumn = (enable) => {
    this.modifiedRecentColumnIsEnabled = enable;
  };

  setModifiedVDRColumn = (enable) => {
    this.modifiedVDRColumnIsEnabled = enable;
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

  setSizeRecentColumn = (enable) => {
    this.sizeRecentColumnIsEnabled = enable;
  };

  setSizeVDRColumn = (enable) => {
    this.sizeVDRColumnIsEnabled = enable;
  };

  setTypeColumn = (enable) => {
    this.typeColumnIsEnabled = enable;
  };

  setTypeRecentColumn = (enable) => {
    this.typeRecentColumnIsEnabled = enable;
  };

  setTypeVDRColumn = (enable) => {
    this.typeVDRColumnIsEnabled = enable;
  };

  setTypeTemplatesColumn = (enable) => {
    this.templatesRoomColumnTypeIsEnabled = enable;
  };

  setAuthorTrashColumn = (enable) => (this.authorTrashColumnIsEnabled = enable);

  setCreatedTrashColumn = (enable) =>
    (this.createdTrashColumnIsEnabled = enable);

  setSizeTrashColumn = (enable) => (this.sizeTrashColumnIsEnabled = enable);

  setTypeTrashColumn = (enable) => (this.typeTrashColumnIsEnabled = enable);

  setLastOpenedColumn = (enable) => (this.lastOpenedColumnIsEnabled = enable);

  setGroupsColumnPeople = (enable) =>
    (this.peopleGroupsColumnIsEnabled = enable);

  setGroupsColumnManager = (enable) =>
    (this.managerGroupsColumnIsEnabled = enable);

  setPeopleColumnType = (enable) => (this.typePeopleColumnIsEnabled = enable);

  setPeopleColumnEmail = (enable) => (this.emailPeopleColumnIsEnabled = enable);

  setPeopleColumnGroup = (enable) => (this.groupPeopleColumnIsEnabled = enable);

  setPeopleColumnStorage = (enable) =>
    (this.storagePeopleColumnIsEnabled = enable);

  setGuestsColumnInviter = (enable) =>
    (this.inviterGuestsColumnIsEnabled = enable);

  setGuestsColumnEmail = (enable) => (this.emailGuestsColumnIsEnabled = enable);

  setGuestsColumnInvitedDate = (enable) =>
    (this.invitedDateGuestsColumnIsEnabled = enable);

  setInsideGroupColumnType = (enable) =>
    (this.typeInsideGroupColumnIsEnabled = enable);

  setInsideGroupColumnEmail = (enable) =>
    (this.emailInsideGroupColumnIsEnabled = enable);

  setInsideGroupColumnGroup = (enable) =>
    (this.groupInsideGroupColumnIsEnabled = enable);

  setInsideGroupColumnStorage = (enable) =>
    (this.storageInsideGroupColumnIsEnabled = enable);

  setColumnsEnable = (frameTableColumns, isRecentTab) => {
    const { contactsTab } = this.peopleStore.usersStore;
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
        isTemplatesFolder,
        isPersonalReadOnly,
      } = this.treeFoldersStore;

      const contactsView = getContactsView();

      const isContactsPeople = !contactsTab
        ? contactsView === "people"
        : contactsTab === "people";
      const isContactsGuests = !contactsTab
        ? contactsView === "guests"
        : contactsTab === "guests";
      const isContactsGroups = !contactsTab
        ? contactsView === "groups"
        : contactsTab === "groups";
      const isContactsInsideGroup = !contactsTab
        ? contactsView === "inside_group"
        : contactsTab === "inside_group";

      const isRooms = isRoomsFolder || isArchiveFolder;

      if (isTemplatesFolder) {
        this.setTypeTemplatesColumn(splitColumns.includes("TypeTemplates"));
        this.setTemplateRoomColumnTags(splitColumns.includes("TagsTemplates"));
        this.setOwnerTemplatesColumn(splitColumns.includes("OwnerTemplates"));
        this.setTemplateRoomColumnActivity(
          splitColumns.includes("ActivityTemplates"),
        );
        this.setTemplateRoomColumnQuota(
          splitColumns.includes("StorageTemplates"),
        );

        return;
      }

      if (isRooms) {
        this.setRoomColumnType(splitColumns.includes("Type"));
        this.setRoomColumnTags(splitColumns.includes("Tags"));
        this.setRoomColumnOwner(splitColumns.includes("Owner"));
        this.setRoomColumnActivity(splitColumns.includes("Activity"));
        this.setRoomColumnQuota(splitColumns.includes("Storage"));
        return;
      }

      if (isContactsGroups) {
        this.setGroupsColumnPeople(splitColumns.includes("People"));
        this.setGroupsColumnManager(splitColumns.includes("Head of Group"));
        return;
      }

      if (isContactsPeople) {
        this.setPeopleColumnType(splitColumns.includes("Type"));
        this.setPeopleColumnEmail(splitColumns.includes("Mail"));
        this.setPeopleColumnGroup(splitColumns.includes("Department"));
        this.setPeopleColumnStorage(splitColumns.includes("Storage"));
        return;
      }

      if (isContactsGuests) {
        this.setGuestsColumnEmail(splitColumns.includes("Mail"));
        this.setGuestsColumnInviter(splitColumns.includes("Inviter"));
        this.setGuestsColumnInvitedDate(splitColumns.includes("InvitedDate"));

        return;
      }

      if (isContactsInsideGroup) {
        this.setInsideGroupColumnType(splitColumns.includes("Type"));
        this.setInsideGroupColumnEmail(splitColumns.includes("Mail"));
        this.setInsideGroupColumnGroup(splitColumns.includes("Department"));
        this.setInsideGroupColumnStorage(splitColumns.includes("Storage"));
        return;
      }

      if (isTrashFolder) {
        this.setRoomColumn(splitColumns.includes("Room"));
        this.setAuthorTrashColumn(splitColumns.includes("AuthorTrash"));
        this.setCreatedTrashColumn(splitColumns.includes("CreatedTrash"));
        this.setErasureColumn(splitColumns.includes("Erasure"));
        this.setSizeTrashColumn(splitColumns.includes("SizeTrash"));
        this.setTypeTrashColumn(splitColumns.includes("TypeTrash"));
        return;
      }

      if (isRecentTab) {
        this.setModifiedRecentColumn(splitColumns.includes("ModifiedRecent"));
        this.setAuthorRecentColumn(splitColumns.includes("AuthorRecent"));
        this.setCreatedRecentColumn(splitColumns.includes("CreatedRecent"));
        this.setLastOpenedColumn(splitColumns.includes("LastOpened"));
        this.setSizeRecentColumn(splitColumns.includes("SizeRecent"));
        this.setTypeRecentColumn(splitColumns.includes("TypeRecent"));
        return;
      }

      if (this.selectedFolderStore.isIndexedFolder) {
        this.setAuthorVDRColumn(splitColumns.includes("AuthorIndexing"));
        this.setCreatedVDRColumn(splitColumns.includes("CreatedIndexing"));
        this.setModifiedVDRColumn(splitColumns.includes("ModifiedIndexing"));
        this.setSizeVDRColumn(splitColumns.includes("SizeIndexing"));
        this.setTypeVDRColumn(splitColumns.includes("TypeIndexing"));
      }

      this.setModifiedColumn(splitColumns.includes("Modified"));
      this.setAuthorColumn(splitColumns.includes("Author"));
      this.setCreatedColumn(splitColumns.includes("Created"));
      if (isPersonalReadOnly)
        this.setErasureColumn(splitColumns.includes("Erasure"));
      this.setSizeColumn(splitColumns.includes("Size"));
      this.setTypeColumn(splitColumns.includes("Type"));
      this.setLastOpenedColumn(splitColumns.includes("LastOpened"));
    }
  };

  setColumnEnable = (key) => {
    const { isRoomsFolder, isArchiveFolder } = this.treeFoldersStore;

    const { contactsTab } = this.peopleStore.usersStore;

    const contactsView = getContactsView();

    const isContactsPeople = !contactsTab
      ? contactsView === "people"
      : contactsTab === "people";
    const isContactsInsideGroup = !contactsTab
      ? contactsView === "inside_group"
      : contactsTab === "inside_group";

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
      case "AuthorRecent":
        this.setAuthorRecentColumn(!this.authorRecentColumnIsEnabled);
        return;
      case "AuthorIndexing":
        this.setAuthorVDRColumn(!this.authorVDRColumnIsEnabled);
        return;
      case "OwnerTemplates":
        this.setOwnerTemplatesColumn(!this.templatesRoomColumnOwnerIsEnabled);
        return;
      case "Created":
        this.setCreatedColumn(!this.createdColumnIsEnabled);
        return;
      case "CreatedTrash":
        this.setCreatedTrashColumn(!this.createdTrashColumnIsEnabled);
        return;
      case "CreatedRecent":
        this.setCreatedRecentColumn(!this.createdRecentColumnIsEnabled);
        return;
      case "CreatedIndexing":
        this.setCreatedVDRColumn(!this.createdVDRColumnIsEnabled);
        return;

      case "Department":
        if (isContactsPeople)
          this.setPeopleColumnGroup(!this.groupPeopleColumnIsEnabled);
        else
          this.setInsideGroupColumnGroup(!this.groupInsideGroupColumnIsEnabled);
        return;

      case "Modified":
        this.setModifiedColumn(!this.modifiedColumnIsEnabled);
        return;
      case "ModifiedRecent":
        this.setModifiedRecentColumn(!this.modifiedRecentColumnIsEnabled);
        return;
      case "ModifiedIndexing":
        this.setModifiedVDRColumn(!this.modifiedVDRColumnIsEnabled);
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
      case "SizeRecent":
        this.setSizeRecentColumn(!this.sizeRecentColumnIsEnabled);
        return;

      case "SizeIndexing":
        this.setSizeVDRColumn(!this.sizeVDRColumnIsEnabled);
        return;

      case "Type":
        isRooms
          ? this.setRoomColumnType(!this.roomColumnTypeIsEnabled)
          : isContactsPeople
            ? this.setPeopleColumnType(!this.typePeopleColumnIsEnabled)
            : isContactsInsideGroup
              ? this.setInsideGroupColumnType(
                  !this.typeInsideGroupColumnIsEnabled,
                )
              : this.setTypeColumn(!this.typeColumnIsEnabled);
        return;

      case "TypeTrash":
        this.setTypeTrashColumn(!this.typeTrashColumnIsEnabled);
        return;

      case "TypeRecent":
        this.setTypeRecentColumn(!this.typeRecentColumnIsEnabled);
        return;

      case "TypeIndexing":
        this.setTypeVDRColumn(!this.typeVDRColumnIsEnabled);
        return;

      case "Owner":
        this.setRoomColumnOwner(!this.roomColumnOwnerIsEnabled);
        return;

      case "TypeTemplates":
        this.setTypeTemplatesColumn(!this.templatesRoomColumnTypeIsEnabled);
        return;

      case "Tags":
        this.setRoomColumnTags(!this.roomColumnTagsIsEnabled);
        return;

      case "TagsTemplates":
        this.setTemplateRoomColumnTags(!this.templateRoomColumnTagsIsEnabled);
        return;

      case "Activity":
        this.setRoomColumnActivity(!this.roomColumnActivityIsEnabled);
        return;

      case "ActivityTemplates":
        this.setTemplateRoomColumnActivity(
          !this.templateRoomColumnActivityIsEnabled,
        );
        return;

      case "LastOpened":
        this.setLastOpenedColumn(!this.lastOpenedColumnIsEnabled);
        return;

      case "Mail":
        if (isContactsPeople)
          this.setPeopleColumnEmail(!this.emailPeopleColumnIsEnabled);
        else if (isContactsInsideGroup)
          this.setInsideGroupColumnEmail(!this.emailInsideGroupColumnIsEnabled);
        else this.setGuestsColumnEmail(!this.emailGuestsColumnIsEnabled);

        return;

      case "InvitedDate":
        this.setGuestsColumnInvitedDate(!this.invitedDateGuestsColumnIsEnabled);
        return;

      case "Storage":
        isContactsPeople
          ? this.setPeopleColumnStorage(!this.storagePeopleColumnIsEnabled)
          : isContactsInsideGroup
            ? this.setInsideGroupColumnStorage(
                !this.storageInsideGroupColumnIsEnabled,
              )
            : this.setRoomColumnQuota(!this.roomQuotaColumnIsEnable);
        return;

      case "StorageTemplates":
        this.setTemplateRoomColumnQuota(!this.templateRoomQuotaColumnIsEnable);
        return;

      case "Inviter":
        this.setGuestsColumnInviter(!this.inviterGuestsColumnIsEnabled);
        return;

      case "People":
        this.setGroupsColumnPeople(!this.peopleGroupsColumnIsEnabled);
        return;

      case "Head of Group":
        this.setGroupsColumnManager(!this.managerGroupsColumnIsEnabled);

      default:
    }
  };

  getColumns = (defaultColumns, isRecentTab) => {
    const { isFrame, frameConfig } = this.settingsStore;
    const storageColumns = localStorage.getItem(this.tableStorageName);
    const splitColumns = storageColumns && storageColumns.split(",");
    const frameTableColumns = frameConfig?.viewTableColumns;

    const columns = [];

    if (splitColumns) {
      this.setColumnsEnable(null, isRecentTab);

      defaultColumns.forEach((col) => {
        const column = splitColumns.find((key) => key === col.key);
        column ? (col.enable = true) : (col.enable = false);

        columns.push(col);
      });
      return columns;
    }
    if (isFrame && frameTableColumns) {
      this.setColumnsEnable(frameTableColumns);

      const frameTableArray = frameTableColumns.split(",");
      return defaultColumns.map((col) => {
        col.enable = !!frameTableArray.includes(col.key);
        return col;
      });
    }
    return defaultColumns;
  };

  // Column names
  get tableStorageName() {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      isRecentTab,
      isTemplatesFolder,
    } = this.treeFoldersStore;

    const { contactsTab } = this.peopleStore.usersStore;
    const { isIndexedFolder } = this.selectedFolderStore;

    const contactsView = getContactsView();

    const isContactsPeople = !contactsTab
      ? contactsView === "people"
      : contactsTab === "people";
    const isContactsGuests = !contactsTab
      ? contactsView === "guests"
      : contactsTab === "guests";
    const isContactsGroups = !contactsTab
      ? contactsView === "groups"
      : contactsTab === "groups";
    const isContactsInsideGroup = !contactsTab
      ? contactsView === "inside_group"
      : contactsTab === "inside_group";

    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;
    const isDocumentsFolder = !isRooms;

    let tableStorageName;

    if (isTemplatesFolder)
      tableStorageName = `${TABLE_TEMPLATES_ROOM_COLUMNS}=${userId}`;
    else if (isRooms) tableStorageName = `${TABLE_ROOMS_COLUMNS}=${userId}`;
    else if (isContactsPeople)
      tableStorageName = `${TABLE_PEOPLE_COLUMNS}=${userId}`;
    else if (isContactsGuests)
      tableStorageName = `${TABLE_GUESTS_COLUMNS}=${userId}`;
    else if (isContactsGroups)
      tableStorageName = `${TABLE_GROUPS_COLUMNS}=${userId}`;
    else if (isContactsInsideGroup)
      tableStorageName = `${TABLE_INSIDE_GROUP_COLUMNS}=${userId}`;
    else if (isTrashFolder)
      tableStorageName = `${TABLE_TRASH_COLUMNS}=${userId}`;
    else if (isRecentTab)
      tableStorageName = `${TABLE_RECENT_COLUMNS}=${userId}`;
    else if (isIndexedFolder)
      tableStorageName = `${TABLE_VDR_INDEXING_COLUMNS}=${userId}`;
    else if (isDocumentsFolder) tableStorageName = `${TABLE_COLUMNS}=${userId}`;
    else tableStorageName = "";

    return isFrame && tableStorageName
      ? `SDK_${tableStorageName}`
      : tableStorageName;
  }

  // Table column sizes
  get columnStorageName() {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      isRecentTab,
      isTemplatesFolder,
    } = this.treeFoldersStore;

    const { contactsTab } = this.peopleStore.usersStore;
    const { isIndexedFolder } = this.selectedFolderStore;

    const contactsView = getContactsView();

    const isContactsPeople = !contactsTab
      ? contactsView === "people"
      : contactsTab === "people";
    const isContactsGuests = !contactsTab
      ? contactsView === "guests"
      : contactsTab === "guests";
    const isContactsGroups = !contactsTab
      ? contactsView === "groups"
      : contactsTab === "groups";
    const isContactsInsideGroup = !contactsTab
      ? contactsView === "inside_group"
      : contactsTab === "inside_group";

    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;
    const isDocumentsFolder = !isRooms;

    let columnStorageName;

    if (isTemplatesFolder)
      columnStorageName = `${COLUMNS_TEMPLATES_ROOM_SIZE}=${userId}`;
    else if (isRooms) columnStorageName = `${COLUMNS_ROOMS_SIZE}=${userId}`;
    else if (isTrashFolder)
      columnStorageName = `${COLUMNS_TRASH_SIZE}=${userId}`;
    else if (isRecentTab)
      columnStorageName = `${COLUMNS_RECENT_SIZE}=${userId}`;
    else if (isIndexedFolder)
      columnStorageName = `${COLUMNS_VDR_INDEXING_SIZE}=${userId}`;
    else if (isContactsPeople)
      columnStorageName = `${COLUMNS_PEOPLE_SIZE}=${userId}`;
    else if (isContactsGuests)
      columnStorageName = `${COLUMNS_GUESTS_SIZE}=${userId}`;
    else if (isContactsInsideGroup)
      columnStorageName = `${COLUMNS_INSIDE_GROUPS_SIZE}=${userId}`;
    else if (isContactsGroups)
      columnStorageName = `${COLUMNS_GROUPS_SIZE}=${userId}`;
    else if (isDocumentsFolder) columnStorageName = `${COLUMNS_SIZE}=${userId}`;
    else columnStorageName = "";

    return isFrame && columnStorageName
      ? `SDK_${columnStorageName}`
      : columnStorageName;
  }

  // Column names for info-panel
  get columnInfoPanelStorageName() {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      isRecentTab,
      isTemplatesFolder,
    } = this.treeFoldersStore;

    const { isIndexedFolder } = this.selectedFolderStore;
    const { contactsTab } = this.peopleStore.usersStore;

    const contactsView = getContactsView();

    const isContactsPeople = !contactsTab
      ? contactsView === "people"
      : contactsTab === "people";
    const isContactsGuests = !contactsTab
      ? contactsView === "guests"
      : contactsTab === "guests";
    const isContactsGroups = !contactsTab
      ? contactsView === "groups"
      : contactsTab === "groups";
    const isContactsInsideGroup = !contactsTab
      ? contactsView === "inside_group"
      : contactsTab === "inside_group";

    const isRooms = isRoomsFolder || isArchiveFolder;
    const userId = this.userStore.user?.id;
    const isFrame = this.settingsStore.isFrame;
    const isDocumentsFolder = !isRooms;

    let columnInfoPanelStorageName;

    if (isTemplatesFolder)
      columnInfoPanelStorageName = `${COLUMNS_TEMPLATES_ROOM_SIZE_INFO_PANEL}=${userId}`;
    else if (isRooms)
      columnInfoPanelStorageName = `${COLUMNS_ROOMS_SIZE_INFO_PANEL}=${userId}`;
    else if (isTrashFolder)
      columnInfoPanelStorageName = `${COLUMNS_TRASH_SIZE_INFO_PANEL}=${userId}`;
    else if (isRecentTab)
      columnInfoPanelStorageName = `${COLUMNS_RECENT_SIZE_INFO_PANEL}=${userId}`;
    else if (isIndexedFolder)
      columnInfoPanelStorageName = `${COLUMNS_VDR_INDEXING_SIZE_INFO_PANEL}=${userId}`;
    else if (isContactsPeople)
      columnInfoPanelStorageName = `${COLUMNS_PEOPLE_INFO_PANEL_SIZE}=${userId}`;
    else if (isContactsGuests)
      columnInfoPanelStorageName = `${COLUMNS_GUESTS_INFO_PANEL_SIZE}=${userId}`;
    else if (isContactsInsideGroup)
      columnInfoPanelStorageName = `${COLUMNS_INSIDE_GROUPS_INFO_PANEL_SIZE}=${userId}`;
    else if (isContactsGroups)
      columnInfoPanelStorageName = `${COLUMNS_GROUPS_INFO_PANEL_SIZE}=${userId}`;
    else if (isDocumentsFolder)
      columnInfoPanelStorageName = `${COLUMNS_SIZE_INFO_PANEL}=${userId}`;
    else columnInfoPanelStorageName = "";

    return isFrame && columnInfoPanelStorageName
      ? `SDK_${columnInfoPanelStorageName}`
      : columnInfoPanelStorageName;
  }
}

export default TableStore;
