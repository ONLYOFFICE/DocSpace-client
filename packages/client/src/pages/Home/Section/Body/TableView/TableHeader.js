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

import React from "react";
import { TableHeader } from "@docspace/shared/components/table";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Events, SortByFieldName } from "@docspace/shared/enums";

class FilesTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const defaultColumns = this.getDefaultColumns();
    const columns = props.getColumns(defaultColumns);

    const storageColumns = localStorage.getItem(props.tableStorageName);
    const splitColumns = storageColumns && storageColumns.split(",");
    const resetColumnsSize =
      (splitColumns && splitColumns.length !== columns.length) || !splitColumns;

    this.state = {
      columns,
      resetColumnsSize,
      columnStorageName: props.columnStorageName,
      columnInfoPanelStorageName: props.columnInfoPanelStorageName,
      sortBy: props.isRooms ? props.roomsFilter.sortBy : props.filter.sortBy,
      sortOrder: props.isRooms
        ? props.roomsFilter.sortOrder
        : props.filter.sortOrder,
    };

    const tableColumns = columns.map((c) => c.enable && c.key);

    this.setTableColumns(tableColumns);

    this.isBeginScrolling = false;
  }

  componentDidMount() {
    this.customScrollElm = document.getElementsByClassName("section-scroll")[0];
    this.customScrollElm?.addEventListener("scroll", this.onBeginScroll);
  }

  componentDidUpdate(prevProps) {
    const {
      isRooms,
      isTrashFolder,
      columnStorageName,
      columnInfoPanelStorageName,
      isRecentFolder,
      isSharedWithMeFolderRoot,
      isFavoritesFolder,
      isArchiveFolder,
      isIndexEditingMode,
      showStorageInfo,
      indexColumnSize,
      roomsFilter,
      filter,
      changeDocumentsTabs,
      withContent,
      headerBorder,
    } = this.props;

    const sortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;
    const sortOrder = isRooms ? roomsFilter.sortOrder : filter.sortOrder;

    const { sortBy: stateSortBy, sortOrder: stateSortOrder } = this.state;

    if (
      isArchiveFolder !== prevProps.isArchiveFolder ||
      indexColumnSize !== prevProps.indexColumnSize ||
      isIndexEditingMode !== prevProps.isIndexEditingMode ||
      isRooms !== prevProps.isRooms ||
      isTrashFolder !== prevProps.isTrashFolder ||
      columnStorageName !== prevProps.columnStorageName ||
      columnInfoPanelStorageName !== prevProps.columnInfoPanelStorageName ||
      isRecentFolder !== prevProps.isRecentFolder ||
      isSharedWithMeFolderRoot !== prevProps.isSharedWithMeFolderRoot ||
      isFavoritesFolder !== prevProps.isFavoritesFolder ||
      showStorageInfo !== prevProps.showStorageInfo ||
      (!changeDocumentsTabs && sortBy !== stateSortBy) ||
      (!changeDocumentsTabs && sortOrder !== stateSortOrder)
    ) {
      return this.updateTableColumns();
    }

    const { columns } = this.state;

    if (withContent !== prevProps.withContent) {
      const columnIndex = columns.findIndex((c) => c.key === "Share");
      if (columnIndex === -1) return;

      columns[columnIndex].enable = withContent;
      this.setState({ columns });
    }

    if (headerBorder) {
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

  onBeginScroll = () => {
    const { firstElemChecked, headerBorder } = this.props;

    const currentScrollPosition = this.customScrollElm.scrollTop;
    const elem = document.getElementById("table-container_caption-header");

    if (currentScrollPosition === 0) {
      this.isBeginScrolling = false;

      headerBorder && elem?.classList?.add("hotkeys-lengthen-header");

      !firstElemChecked && elem?.classList?.remove("lengthen-header");
      return;
    }

    if (!this.isBeginScrolling) {
      elem?.classList?.remove("hotkeys-lengthen-header");
      elem?.classList?.add("lengthen-header");
    }

    this.isBeginScrolling = true;
  };

  setTableColumns = (tableColumns) => {
    const { tableStorageName } = this.props;
    localStorage.setItem(tableStorageName, tableColumns);
  };

  updateTableColumns = () => {
    const {
      isRooms,
      getColumns,
      columnStorageName,
      columnInfoPanelStorageName,
      tableStorageName,
      roomsFilter,
      filter,
    } = this.props;

    const defaultColumns = this.getDefaultColumns();

    const columns = getColumns(defaultColumns);
    const storageColumns = localStorage.getItem(tableStorageName);
    const splitColumns = storageColumns && storageColumns.split(",");
    const resetColumnsSize =
      (splitColumns && splitColumns.length !== columns.length) || !splitColumns;

    const tableColumns = columns.map((c) => c.enable && c.key);

    const sortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;
    const sortOrder = isRooms ? roomsFilter.sortOrder : filter.sortOrder;

    this.setTableColumns(tableColumns);

    this.setState({
      columns,
      resetColumnsSize,
      columnStorageName,
      columnInfoPanelStorageName,
      sortBy,
      sortOrder,
    });
  };

  getDefaultColumns = () => {
    const {
      isRooms,
      isTrashFolder,
      isRecentFolder,
      isFavoritesFolder,
      isTemplatesFolder,
      isIndexing,
      isSharedWithMeFolderRoot,
    } = this.props;

    if (isSharedWithMeFolderRoot) return this.getSharedWithMeFolderColumns();
    if (isTemplatesFolder) return this.getTemplatesColumns();
    if (isRooms) return this.getRoomsColumns();
    if (isTrashFolder) return this.getTrashFolderColumns();
    if (isRecentFolder) return this.getRecentFolderColumns();
    if (isFavoritesFolder) return this.getFavoritesFolderColumns();
    if (isIndexing) return this.getIndexingColumns();
    return this.getFilesColumns();
  };

  getFilesColumns = () => {
    const {
      t,
      isPublicRoom,
      authorColumnIsEnabled,
      nameColumnIsEnabled,
      typeColumnIsEnabled,
      sizeColumnIsEnabled,
      createdColumnIsEnabled,
      modifiedColumnIsEnabled,
      erasureColumnIsEnabled,
      isPersonalReadOnly,
    } = this.props;

    const authorBlock = !isPublicRoom
      ? {
          key: "Author",
          title: t("ByAuthor"),
          enable: authorColumnIsEnabled,
          resizable: true,
          sortBy: SortByFieldName.Author,
          // onClick: this.onFilter,
          onChange: this.onColumnChange,
        }
      : {};

    const erasureBlock = isPersonalReadOnly
      ? {
          key: "Erasure",
          title: t("ByErasure"),
          enable: erasureColumnIsEnabled,
          resizable: true,
          sortBy: SortByFieldName.ModifiedDate,
          onClick: this.onFilter,
          onChange: this.onColumnChange,
        }
      : {};

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      { ...authorBlock },
      {
        key: "Created",
        title: t("ByCreation"),
        enable: createdColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Modified",
        title: t("ByLastModified"),
        enable: modifiedColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      { ...erasureBlock },
      {
        key: "Size",
        title: t("Common:Size"),
        enable: sizeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        enable: typeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getIndexingColumns = () => {
    const {
      t,
      isPublicRoom,
      indexColumnSize,
      authorVDRColumnIsEnabled,
      indexVDRColumnIsEnabled,
      nameColumnIsEnabled,
      createdVDRColumnIsEnabled,
      modifiedVDRColumnIsEnabled,
      sizeVDRColumnIsEnabled,
      typeVDRColumnIsEnabled,
    } = this.props;

    const authorBlock = !isPublicRoom
      ? {
          key: "AuthorIndexing",
          title: t("ByAuthor"),
          enable: authorVDRColumnIsEnabled,
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
        enable: indexVDRColumnIsEnabled,
        minWidth: indexColumnSize,
        resizable: false,
        isShort: true,
      },
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      { ...authorBlock },
      {
        key: "CreatedIndexing",
        title: t("ByCreation"),
        enable: createdVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "ModifiedIndexing",
        title: t("ByLastModified"),
        enable: modifiedVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeIndexing",
        title: t("Common:Size"),
        enable: sizeVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeIndexing",
        title: t("Common:Type"),
        enable: typeVDRColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getSharedWithMeFolderColumns = () => {
    const {
      t,
      nameColumnIsEnabled,
      authorShareWithMeColumnIsEnabled,
      accessLevelShareWithMeColumnIsEnabled,
      sharedByShareWithMeColumnIsEnabled,
      modifiedShareWithMeColumnIsEnabled,
      sizeShareWithMeColumnIsEnabled,
      typeShareWithMeColumnIsEnabled,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        default: true,
        resizable: true,
        minWidth: 210,
        enable: nameColumnIsEnabled,
        sortBy: SortByFieldName.Name,
        onClick: this.onFilter,
      },
      {
        key: "SharedByShareWithMe",
        title: t("SharedBy"),
        enable: sharedByShareWithMeColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "AuthorShareWithMe",
        title: t("ByAuthor"),
        enable: authorShareWithMeColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "AccessLevelShareWithMe",
        title: t("AccessLevel"),
        enable: accessLevelShareWithMeColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "ModifiedShareWithMe",
        title: t("ByLastModified"),
        enable: modifiedShareWithMeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeShareWithMe",
        title: t("Common:Size"),
        enable: sizeShareWithMeColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeShareWithMe",
        title: t("Common:Type"),
        enable: typeShareWithMeColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];

    return columns;
  };

  getRecentFolderColumns = () => {
    const {
      t,
      nameColumnIsEnabled,
      locationRecentColumnIsEnabled,
      lastOpenedRecentColumnIsEnabled,
      authorRecentColumnIsEnabled,
      sizeRecentColumnIsEnabled,
      typeRecentColumnIsEnabled,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: nameColumnIsEnabled,
        default: true,
        minWidth: 210,
      },
      {
        key: "AuthorRecent",
        title: t("ByAuthor"),
        enable: authorRecentColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "LocationRecent",
        title: t("Common:Location"),
        enable: locationRecentColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "LastOpenedRecent",
        title: t("LastOpened"),
        enable: lastOpenedRecentColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeRecent",
        title: t("Common:Size"),
        enable: sizeRecentColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeRecent",
        title: t("Common:Type"),
        enable: typeRecentColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];
    return [...columns];
  };

  getFavoritesFolderColumns = () => {
    const {
      t,
      nameColumnIsEnabled,
      locationFavoritesColumnIsEnabled,
      authorFavoritesColumnIsEnabled,
      sizeFavoritesColumnIsEnabled,
      typeFavoritesColumnIsEnabled,
      modifiedFavoritesColumnIsEnabled,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: nameColumnIsEnabled,
        default: true,
        minWidth: 210,
      },
      {
        key: "AuthorFavorites",
        title: t("ByAuthor"),
        enable: authorFavoritesColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "LocationFavorites",
        title: t("Common:Location"),
        enable: locationFavoritesColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "ModifiedFavorites",
        title: t("ByLastModified"),
        enable: modifiedFavoritesColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeFavorites",
        title: t("Common:Size"),
        enable: sizeFavoritesColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeFavorites",
        title: t("Common:Type"),
        enable: typeFavoritesColumnIsEnabled,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];
    return [...columns];
  };

  getTrashFolderColumns = () => {
    const {
      t,
      nameColumnIsEnabled,
      locationColumnIsEnabled,
      authorTrashColumnIsEnabled,
      createdTrashColumnIsEnabled,
      erasureColumnIsEnabled,
      enable: sizeTrashColumnIsEnabled,
      typeTrashColumnIsEnabled,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: nameColumnIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onFilter,
      },
      {
        key: "Location",
        title: t("Common:Location"),
        enable: locationColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Location,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "AuthorTrash",
        title: t("ByAuthor"),
        enable: authorTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Author,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "CreatedTrash",
        title: t("ByCreation"),
        enable: createdTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.CreationDate,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "Erasure",
        title: t("ByErasure"),
        enable: erasureColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "SizeTrash",
        title: t("Common:Size"),
        enable: sizeTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Size,
        onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
      {
        key: "TypeTrash",
        title: t("Common:Type"),
        enable: typeTrashColumnIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Type,
        // onClick: this.onFilter,
        onChange: this.onColumnChange,
      },
    ];

    return [...columns];
  };

  getRoomsColumns = () => {
    const {
      t,
      isDefaultRoomsQuotaSet,
      showStorageInfo,
      isArchiveFolder,
      roomColumnNameIsEnabled,
      roomColumnOwnerIsEnabled,
      roomColumnActivityIsEnabled,
      roomQuotaColumnIsEnable,
      roomColumnTypeIsEnabled,
      roomColumnTagsIsEnabled,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: roomColumnNameIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        enable: roomColumnTypeIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.RoomType,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Tags",
        title: t("Common:Tags"),
        enable: roomColumnTagsIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Tags,
        withTagRef: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Owner",
        title: t("Common:Owner"),
        enable: roomColumnOwnerIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Author,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "Activity",
        title: t("LastActivity"),
        enable: roomColumnActivityIsEnabled,
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
        enable: roomQuotaColumnIsEnable,
        sortBy: SortByFieldName.UsedSpace,
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      });

    return [...columns];
  };

  getTemplatesColumns = () => {
    const {
      t,
      showStorageInfo,
      isDefaultRoomsQuotaSet,
      isArchiveFolder,
      roomColumnNameIsEnabled,
      templatesRoomColumnTypeIsEnabled,
      templateRoomColumnTagsIsEnabled,
      templatesRoomColumnOwnerIsEnabled,
      templateRoomColumnActivityIsEnabled,
      templateRoomQuotaColumnIsEnable,
    } = this.props;

    const columns = [
      {
        key: "Name",
        title: t("Common:Label"),
        resizable: true,
        enable: roomColumnNameIsEnabled,
        default: true,
        sortBy: SortByFieldName.Name,
        minWidth: 210,
        onClick: this.onRoomsFilter,
      },
      {
        key: "TypeTemplates",
        title: t("Common:Type"),
        enable: templatesRoomColumnTypeIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.RoomType,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "TagsTemplates",
        title: t("Common:Tags"),
        enable: templateRoomColumnTagsIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Tags,
        withTagRef: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "OwnerTemplates",
        title: t("Common:Owner"),
        enable: templatesRoomColumnOwnerIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.Author,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
      {
        key: "ActivityTemplates",
        title: t("LastActivity"),
        enable: templateRoomColumnActivityIsEnabled,
        resizable: true,
        sortBy: SortByFieldName.ModifiedDate,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      },
    ];

    showStorageInfo &&
      columns.splice(columns.length, 0, {
        key: "StorageTemplates",
        title:
          isDefaultRoomsQuotaSet && !isArchiveFolder
            ? t("Common:StorageAndQuota")
            : t("Common:Storage"),
        enable: templateRoomQuotaColumnIsEnable,
        sortBy: SortByFieldName.UsedSpace,
        resizable: true,
        onChange: this.onColumnChange,
        onClick: this.onRoomsFilter,
      });

    return [...columns];
  };

  onColumnChange = (key) => {
    const { columns } = this.state;
    const { setColumnEnable } = this.props;

    const columnIndex = columns.findIndex((c) => c.key === key);
    if (columnIndex === -1) return;

    setColumnEnable(key);

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);
    this.setTableColumns(tableColumns);

    const event = new Event(Events.CHANGE_COLUMN);

    window.dispatchEvent(event);
  };

  onFilter = (sortBy) => {
    const { filter, setIsLoading } = this.props;
    const newFilter = filter.clone();

    if (newFilter.sortBy !== sortBy) {
      newFilter.sortBy = sortBy;
    } else {
      newFilter.sortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";
    }

    setIsLoading(true);

    window.DocSpace.navigate(
      `${window.DocSpace.location.pathname}?${newFilter.toUrlParams()}`,
    );
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
    const {
      isArchiveFolder,
      isTrashFolder,
      isTemplatesFolder,
      isPersonalReadOnly,
      isRecentFolder,
      isFavoritesFolder,
      isSharedWithMeFolderRoot,
    } = treeFoldersStore;
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
      locationColumnIsEnabled,
      erasureColumnIsEnabled,
      sizeColumnIsEnabled,
      sizeTrashColumnIsEnabled,
      typeColumnIsEnabled,
      typeTrashColumnIsEnabled,

      roomColumnNameIsEnabled,
      roomColumnTypeIsEnabled,
      roomColumnTagsIsEnabled,
      roomColumnOwnerIsEnabled,
      roomColumnActivityIsEnabled,
      roomQuotaColumnIsEnable,

      authorShareWithMeColumnIsEnabled,
      accessLevelShareWithMeColumnIsEnabled,
      sharedByShareWithMeColumnIsEnabled,
      modifiedShareWithMeColumnIsEnabled,
      sizeShareWithMeColumnIsEnabled,
      typeShareWithMeColumnIsEnabled,

      locationRecentColumnIsEnabled,
      lastOpenedRecentColumnIsEnabled,
      authorRecentColumnIsEnabled,
      sizeRecentColumnIsEnabled,
      typeRecentColumnIsEnabled,

      locationFavoritesColumnIsEnabled,
      authorFavoritesColumnIsEnabled,
      sizeFavoritesColumnIsEnabled,
      typeFavoritesColumnIsEnabled,
      modifiedFavoritesColumnIsEnabled,

      indexVDRColumnIsEnabled,
      authorVDRColumnIsEnabled,
      modifiedVDRColumnIsEnabled,
      createdVDRColumnIsEnabled,
      sizeVDRColumnIsEnabled,
      typeVDRColumnIsEnabled,

      templatesRoomColumnTypeIsEnabled,
      templateRoomColumnTagsIsEnabled,
      templatesRoomColumnOwnerIsEnabled,
      templateRoomColumnActivityIsEnabled,
      templateRoomQuotaColumnIsEnable,

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
      locationColumnIsEnabled,
      erasureColumnIsEnabled,
      sizeColumnIsEnabled,
      sizeTrashColumnIsEnabled,
      typeColumnIsEnabled,
      typeTrashColumnIsEnabled,

      roomColumnNameIsEnabled,
      roomColumnTypeIsEnabled,
      roomColumnTagsIsEnabled,
      roomColumnOwnerIsEnabled,
      roomColumnActivityIsEnabled,
      roomQuotaColumnIsEnable,

      authorShareWithMeColumnIsEnabled,
      accessLevelShareWithMeColumnIsEnabled,
      sharedByShareWithMeColumnIsEnabled,
      modifiedShareWithMeColumnIsEnabled,
      sizeShareWithMeColumnIsEnabled,
      typeShareWithMeColumnIsEnabled,

      locationRecentColumnIsEnabled,
      lastOpenedRecentColumnIsEnabled,
      authorRecentColumnIsEnabled,
      sizeRecentColumnIsEnabled,
      typeRecentColumnIsEnabled,

      locationFavoritesColumnIsEnabled,
      authorFavoritesColumnIsEnabled,
      sizeFavoritesColumnIsEnabled,
      typeFavoritesColumnIsEnabled,
      modifiedFavoritesColumnIsEnabled,

      indexVDRColumnIsEnabled,
      authorVDRColumnIsEnabled,
      modifiedVDRColumnIsEnabled,
      createdVDRColumnIsEnabled,
      sizeVDRColumnIsEnabled,
      typeVDRColumnIsEnabled,

      templatesRoomColumnTypeIsEnabled,
      templateRoomColumnTagsIsEnabled,
      templatesRoomColumnOwnerIsEnabled,
      templateRoomColumnActivityIsEnabled,
      templateRoomQuotaColumnIsEnable,

      getColumns,
      setColumnEnable,
      isTrashFolder,
      isTemplatesFolder,
      isPublicRoom,
      publicRoomKey,

      isFrame,
      isRecentFolder,
      isSharedWithMeFolderRoot,
      isFavoritesFolder,
      showSettings: frameConfig?.showSettings,
      isDefaultRoomsQuotaSet,
      showStorageInfo,
      isArchiveFolder,
      isIndexEditingMode,

      indexColumnSize,
      changeDocumentsTabs,
      isPersonalReadOnly,
    };
  },
)(
  withTranslation(["Files", "Common", "Translations", "Notifications"])(
    observer(FilesTableHeader),
  ),
);
