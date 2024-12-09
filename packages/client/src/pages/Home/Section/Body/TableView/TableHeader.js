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

import React from "react";
import { TableHeader } from "@docspace/shared/components/table";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Events } from "@docspace/shared/enums";
import { SortByFieldName } from "SRC_DIR/helpers/constants";

class FilesTableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.getTableColumns();

    this.isBeginScrolling = false;
  }

  getRoomsColumns = () => {
    const { t, isDefaultRoomsQuotaSet, showStorageInfo, isArchiveFolder } =
      this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: this.props.roomColumnNameIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        enable: this.props.roomColumnTypeIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.RoomType,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Tags",
        title: t("Common:Tags"),
        enable: this.props.roomColumnTagsIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Tags,
        withTagRef: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Owner",
        title: t("Common:Owner"),
        enable: this.props.roomColumnOwnerIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Author,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Activity",
        title: t("LastActivity"),
        enable: this.props.roomColumnActivityIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
    ];

    showStorageInfo &&
      columns.splice(columns.length, 0, {
        key: "Storage",
        title:
          isDefaultRoomsQuotaSet && !isArchiveFolder
            ? t("Common:StorageAndQuota")
            : t("Common:Storage"),
        enable: this.props.roomQuotaColumnIsEnable,
        sortBy: SortByFieldName.UsedSpace,
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      });

    return [...columns];
  };

  getTrashFolderColumns = () => {
    const { t } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: this.props.nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      {
        key: "Room",
        title: t("Common:Room"),
        enable: this.props.roomColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Room,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "AuthorTrash",
        title: t("ByAuthor"),
        enable: this.props.authorTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Author,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "CreatedTrash",
        title: t("ByCreation"),
        enable: this.props.createdTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Erasure",
        title: t("ByErasure"),
        enable: this.props.erasureColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeTrash",
        title: t("Common:Size"),
        enable: this.props.sizeTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeTrash",
        title: t("Common:Type"),
        enable: this.props.typeTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getRecentTabColumns = () => {
    const { t, isPublicRoom } = this.props;

    const authorBlock = !isPublicRoom
      ? {
          key: "AuthorRecent",
          title: t("ByAuthor"),
          enable: this.props.authorRecentColumnIsEnabled,
          resizable: true,
          sortBy: SortByFieldName.Author,
          // onClick: this.onFilter,
          onChange: this.onColumnChange,
        }
      : {};

    const columns = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: this.props.nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      { ...authorBlock },
      {
        key: "CreatedRecent",
        title: t("ByCreation"),
        enable: this.props.createdRecentColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "LastOpened",
        title: t("DateLastOpened"),
        enable: this.props.lastOpenedColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.LastOpened,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "ModifiedRecent",
        title: t("ByLastModified"),
        enable: this.props.modifiedRecentColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeRecent",
        title: t("Common:Size"),
        enable: this.props.sizeRecentColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeRecent",
        title: t("Common:Type"),
        enable: this.props.typeRecentColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];
    return [...columns];
  };

  getIndexingColumns = () => {
    const { t, isPublicRoom, indexColumnSize } = this.props;

    const authorBlock = !isPublicRoom
      ? {
          key: "AuthorIndexing",
          title: t("ByAuthor"),
          enable: this.props.authorVDRColumnIsEnabled,
          resizable: true,
          sortBy: SortByFieldName.Author,
          // onClick: this.onFilter,
          onChange: this.onColumnChange,
        }
      : {};

    const columns = [
      {
        key: "Index",
        title: "#",
        enable: this.props.indexVDRColumnIsEnabled,
        minWidth: indexColumnSize,
        resizable: false,
        isShort: true,
      },
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: this.props.nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      { ...authorBlock },
      {
        key: "CreatedIndexing",
        title: t("ByCreation"),
        enable: this.props.createdVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "ModifiedIndexing",
        title: t("ByLastModified"),
        enable: this.props.modifiedVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeIndexing",
        title: t("Common:Size"),
        enable: this.props.sizeVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeIndexing",
        title: t("Common:Type"),
        enable: this.props.typeVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getFilesColumns = () => {
    const { t, isPublicRoom } = this.props;

    const authorBlock = !isPublicRoom
      ? {
          key: "Author",
          title: t("ByAuthor"),
          enable: this.props.authorColumnIsEnabled,
          resizable: true,
          sortBy: SortByFieldName.Author,
          // onClick: this.onFilter,
          onChange: this.onColumnChange,
        }
      : {};

    const columns = [
      {
        key: "Name",
        title: t("Common:Name"),
        resizable: true,
        enable: this.props.nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      { ...authorBlock },
      {
        key: "Created",
        title: t("ByCreation"),
        enable: this.props.createdColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Modified",
        title: t("ByLastModified"),
        enable: this.props.modifiedColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Size",
        title: t("Common:Size"),
        enable: this.props.sizeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        enable: this.props.typeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getDefaultColumns = () => {
    const { isRooms, isTrashFolder, isRecentTab, isIndexing } = this.props;

    if (isRooms) return this.getRoomsColumns();
    if (isTrashFolder) return this.getTrashFolderColumns();
    if (isRecentTab) return this.getRecentTabColumns();
    if (isIndexing) return this.getIndexingColumns();
    return this.getFilesColumns();
  };

  getTableColumns = (fromUpdate = false) => {
    const {
      isRooms,
      getColumns,
      columnStorageName,
      columnInfoPanelStorageName,
      isRecentTab,
      tableStorageName,
      roomsFilter,
      filter,
    } = this.props;

    const defaultColumns = this.getDefaultColumns();

    const columns = getColumns(defaultColumns, isRecentTab);
    const storageColumns = localStorage.getItem(tableStorageName);
    const splitColumns = storageColumns && storageColumns.split(",");
    const resetColumnsSize =
      (splitColumns && splitColumns.length !== columns.length) || !splitColumns;

    const tableColumns = columns.map((c) => c.enable && c.key);

    const sortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;
    const sortOrder = isRooms ? roomsFilter.sortOrder : filter.sortOrder;

    this.setTableColumns(tableColumns);
    if (fromUpdate) {
      this.setState({
        columns,
        resetColumnsSize,
        columnStorageName,
        columnInfoPanelStorageName,
        sortBy,
        sortOrder,
        isRecentTab,
      });
    } else {
      this.state = {
        columns,
        resetColumnsSize,
        columnStorageName,
        columnInfoPanelStorageName,
        sortBy,
        sortOrder,
        isRecentTab,
      };
    }
  };

  setTableColumns = (tableColumns) => {
    localStorage.setItem(this.props.tableStorageName, tableColumns);
  };

  componentDidMount() {
    this.customScrollElm = document.getElementsByClassName("section-scroll")[0];
    this.customScrollElm?.addEventListener("scroll", this.onBeginScroll);
  }

  onBeginScroll = () => {
    const { firstElemChecked } = this.props;

    const currentScrollPosition = this.customScrollElm.scrollTop;
    const elem = document.getElementById("table-container_caption-header");

    if (currentScrollPosition === 0) {
      this.isBeginScrolling = false;

      this.props.headerBorder &&
        elem?.classList?.add("hotkeys-lengthen-header");

      !firstElemChecked && elem?.classList?.remove("lengthen-header");
      return;
    }

    if (!this.isBeginScrolling) {
      elem?.classList?.remove("hotkeys-lengthen-header");
      elem?.classList?.add("lengthen-header");
    }

    this.isBeginScrolling = true;
  };

  componentDidUpdate(prevProps) {
    const {
      isRooms,
      isTrashFolder,
      columnStorageName,
      columnInfoPanelStorageName,
      isRecentTab,
      isArchiveFolder,
      isIndexEditingMode,
      showStorageInfo,
      indexColumnSize,
      roomsFilter,
      filter,
      changeDocumentsTabs,
    } = this.props;

    const sortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;
    const sortOrder = isRooms ? roomsFilter.sortOrder : filter.sortOrder;

    if (
      isArchiveFolder !== prevProps.isArchiveFolder ||
      indexColumnSize !== prevProps.indexColumnSize ||
      isIndexEditingMode !== prevProps.isIndexEditingMode ||
      isRooms !== prevProps.isRooms ||
      isTrashFolder !== prevProps.isTrashFolder ||
      columnStorageName !== prevProps.columnStorageName ||
      columnInfoPanelStorageName !== prevProps.columnInfoPanelStorageName ||
      isRecentTab !== this.state.isRecentTab ||
      showStorageInfo !== prevProps.showStorageInfo ||
      (!changeDocumentsTabs && sortBy !== this.state.sortBy) ||
      (!changeDocumentsTabs && sortOrder !== this.state.sortOrder)
    ) {
      return this.getTableColumns(true);
    }

    const { columns } = this.state;

    if (this.props.withContent !== prevProps.withContent) {
      const columnIndex = columns.findIndex((c) => c.key === "Share");
      if (columnIndex === -1) return;

      columns[columnIndex].enable = this.props.withContent;
      this.setState({ columns });
    }

    if (this.props.headerBorder) {
      const elem = document.getElementById("table-container_caption-header");
      elem?.classList?.add("hotkeys-lengthen-header");
    } else {
      const elem = document.getElementById("table-container_caption-header");
      elem?.classList?.remove("hotkeys-lengthen-header");
    }
  }

  componentWillUnmount() {
    this.customScrollElm?.removeEventListener("scroll", this.onBeginScroll);
  }

  onColumnChange = (key) => {
    const { columns } = this.state;

    const columnIndex = columns.findIndex((c) => c.key === key);
    if (columnIndex === -1) return;

    this.props.setColumnEnable(key);

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);
    this.setTableColumns(tableColumns);

    const event = new Event(Events.CHANGE_COLUMN);

    window.dispatchEvent(event);
  };

  onFilter = (sortBy) => {
    const { filter, setIsLoading, isPublicRoom, publicRoomKey } = this.props;
    const newFilter = filter.clone();

    if (newFilter.sortBy !== sortBy) {
      newFilter.sortBy = sortBy;
    } else {
      newFilter.sortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";
    }

    setIsLoading(true);

    if (isPublicRoom) {
      window.DocSpace.navigate(
        `${
          window.DocSpace.location.pathname
        }?key=${publicRoomKey}&${newFilter.toUrlParams()}`,
      );
    } else {
      window.DocSpace.navigate(
        `${window.DocSpace.location.pathname}?${newFilter.toUrlParams()}`,
      );
    }
  };

  onRoomsFilter = (sortBy) => {
    const { roomsFilter, setIsLoading, navigate, location, setRoomsFilter } =
      this.props;

    const newFilter = roomsFilter.clone();
    if (newFilter.sortBy !== sortBy) {
      newFilter.sortBy = sortBy;
    } else {
      newFilter.sortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";
    }

    setIsLoading(true);
    setRoomsFilter(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  render() {
    const {
      t,
      containerRef,
      isHeaderChecked,
      firstElemChecked,
      sortingVisible,
      infoPanelVisible,

      tagRef,
      setHideColumns,
      isFrame,
      showSettings,

      isIndexing,
      isIndexEditingMode,
    } = this.props;

    const {
      columns,
      resetColumnsSize,
      columnStorageName,
      columnInfoPanelStorageName,
      sortBy,
      sortOrder,
    } = this.state;

    return (
      <TableHeader
        isLengthenHeader={firstElemChecked || isHeaderChecked}
        checkboxSize="32px"
        sorted={sortOrder === "descending"}
        sortBy={sortBy}
        containerRef={containerRef}
        columns={columns}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        resetColumnsSize={resetColumnsSize}
        isIndexing={isIndexing}
        sortingVisible={isIndexing ? false : sortingVisible}
        isIndexEditingMode={isIndexEditingMode}
        infoPanelVisible={infoPanelVisible}
        useReactWindow
        tagRef={tagRef}
        setHideColumns={setHideColumns}
        settingsTitle={t("Files:TableSettingsTitle")}
        showSettings={isFrame ? showSettings : true}
      />
    );
  }
}

export default inject(
  ({
    settingsStore,
    filesStore,
    selectedFolderStore,
    treeFoldersStore,
    tableStore,
    publicRoomStore,
    clientLoadingStore,
    infoPanelStore,
    currentQuotaStore,
    indexingStore,
  }) => {
    const { isVisible: infoPanelVisible } = infoPanelStore;

    const { isDefaultRoomsQuotaSet, showStorageInfo } = currentQuotaStore;

    const { isIndexEditingMode } = indexingStore;

    const {
      isHeaderChecked,

      filter,

      canShare,
      firstElemChecked,
      headerBorder,
      roomsFilter,
      setRoomsFilter,
      indexColumnSize,
    } = filesStore;
    const { isRecentTab, isArchiveFolder, isTrashFolder } = treeFoldersStore;
    const withContent = canShare;
    const sortingVisible = true;
    const { isFrame, frameConfig } = settingsStore;

    const {
      tableStorageName,
      columnStorageName,
      columnInfoPanelStorageName,

      nameColumnIsEnabled,
      authorColumnIsEnabled,
      authorTrashColumnIsEnabled,
      createdColumnIsEnabled,
      createdTrashColumnIsEnabled,
      modifiedColumnIsEnabled,
      roomColumnIsEnabled,
      erasureColumnIsEnabled,
      sizeColumnIsEnabled,
      sizeTrashColumnIsEnabled,
      typeColumnIsEnabled,
      typeTrashColumnIsEnabled,
      lastOpenedColumnIsEnabled,

      roomColumnNameIsEnabled,
      roomColumnTypeIsEnabled,
      roomColumnTagsIsEnabled,
      roomColumnOwnerIsEnabled,
      roomColumnActivityIsEnabled,
      roomQuotaColumnIsEnable,

      authorRecentColumnIsEnabled,
      modifiedRecentColumnIsEnabled,
      createdRecentColumnIsEnabled,
      sizeRecentColumnIsEnabled,
      typeRecentColumnIsEnabled,

      indexVDRColumnIsEnabled,
      authorVDRColumnIsEnabled,
      modifiedVDRColumnIsEnabled,
      createdVDRColumnIsEnabled,
      sizeVDRColumnIsEnabled,
      typeVDRColumnIsEnabled,

      getColumns,
      setColumnEnable,
    } = tableStore;

    const { isPublicRoom, publicRoomKey } = publicRoomStore;
    const { changeDocumentsTabs, isIndexedFolder } = selectedFolderStore;

    return {
      setRoomsFilter,
      isHeaderChecked,
      filter,
      selectedFolderId: selectedFolderStore.id,
      withContent,
      sortingVisible,

      isIndexing: isIndexedFolder,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,

      roomsFilter,

      firstElemChecked,
      headerBorder,

      infoPanelVisible,

      tableStorageName,
      columnStorageName,
      columnInfoPanelStorageName,

      nameColumnIsEnabled,
      authorColumnIsEnabled,
      authorTrashColumnIsEnabled,
      createdColumnIsEnabled,
      createdTrashColumnIsEnabled,
      modifiedColumnIsEnabled,
      roomColumnIsEnabled,
      erasureColumnIsEnabled,
      sizeColumnIsEnabled,
      sizeTrashColumnIsEnabled,
      typeColumnIsEnabled,
      typeTrashColumnIsEnabled,
      lastOpenedColumnIsEnabled,

      roomColumnNameIsEnabled,
      roomColumnTypeIsEnabled,
      roomColumnTagsIsEnabled,
      roomColumnOwnerIsEnabled,
      roomColumnActivityIsEnabled,
      roomQuotaColumnIsEnable,

      authorRecentColumnIsEnabled,
      modifiedRecentColumnIsEnabled,
      createdRecentColumnIsEnabled,
      sizeRecentColumnIsEnabled,
      typeRecentColumnIsEnabled,

      indexVDRColumnIsEnabled,
      authorVDRColumnIsEnabled,
      modifiedVDRColumnIsEnabled,
      createdVDRColumnIsEnabled,
      sizeVDRColumnIsEnabled,
      typeVDRColumnIsEnabled,

      getColumns,
      setColumnEnable,
      isTrashFolder,
      isPublicRoom,
      publicRoomKey,

      isFrame,
      isRecentTab,
      showSettings: frameConfig?.showSettings,
      isDefaultRoomsQuotaSet,
      showStorageInfo,
      isArchiveFolder,
      isIndexEditingMode,

      indexColumnSize,
      changeDocumentsTabs,
    };
  },
)(
  withTranslation(["Files", "Common", "Translations", "Notifications"])(
    observer(FilesTableHeader),
  ),
);
