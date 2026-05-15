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

import classNames from "classnames";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";
import elementResizeDetectorMaker from "element-resize-detector";
import React, { useEffect, useRef, useCallback, useMemo, use } from "react";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";

import { TableContainer, TableBody } from "@docspace/ui-kit/components/table";
import { Context } from "@docspace/ui-kit/utils/context";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import withContainer from "../../../../../HOCs/withContainer";

import styles from "./TableContainer.module.scss";

const elementResizeDetector = elementResizeDetectorMaker({
  strategy: "scroll",
  callOnAdd: false,
});

const Table = ({
  list,
  viewAs,
  setViewAs,
  setFirsElemChecked,
  setHeaderBorder,
  theme,
  infoPanelVisible,
  fetchMoreFiles,
  hasMoreFiles,
  filterTotal,
  isRooms,
  isTrashFolder,
  isIndexEditingMode,
  isTemplatesFolder,
  columnStorageName,
  columnInfoPanelStorageName,
  highlightFile,
  currentDeviceType,
  onEditIndex,
  isIndexing,
  isTutorialEnabled,
  setRefMap,
  deleteRefMap,
  selectedFolderTitle,
  canCreateSecurity,
  setDropTargetPreview,
  disableDrag,
  withContentSelection,
  isFavoritesFolder,
  isSharedWithMeFolder,
  isInSharedFolder,
  isAIAgentsFolder,
}) => {
  const [tagCount, setTagCount] = React.useState(null);
  const [hideColumns, setHideColumns] = React.useState(false);

  const { sectionWidth } = use(Context);

  const ref = useRef(null);
  const tagRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  useEffect(() => {
    return () => {
      if (!tagRef?.current) return;

      elementResizeDetector.uninstall(tagRef.current);
    };
  }, []);

  const onResize = useCallback(
    (node) => {
      const element = tagRef?.current ? tagRef?.current : node;

      if (element) {
        const { width } = element.getBoundingClientRect();

        const columns = Math.floor(width / 100);

        if (columns != tagCount) setTagCount(columns);
      }
    },
    [tagCount],
  );

  const onSetTagRef = useCallback((node) => {
    if (node) {
      tagRef.current = node;
      onResize(node);

      elementResizeDetector.listenTo(node, onResize);
    }
  }, []);

  React.useEffect(() => {
    if (!isRooms && !isAIAgentsFolder) setTagCount(0);
  }, [isRooms, isAIAgentsFolder]);

  const filesListNode = useMemo(() => {
    return list.map((item, index) => (
      <TableRow
        id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
        key={
          item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
        }
        item={item}
        itemIndex={index}
        index={index}
        onEditIndex={onEditIndex}
        isIndexEditingMode={isIndexEditingMode}
        isIndexing={isIndexing}
        setFirsElemChecked={setFirsElemChecked}
        setHeaderBorder={setHeaderBorder}
        theme={theme}
        tagCount={tagCount}
        isRooms={isRooms}
        isTemplates={isTemplatesFolder}
        isTrashFolder={isTrashFolder}
        isFavoritesFolder={isFavoritesFolder}
        isSharedWithMeFolder={isSharedWithMeFolder}
        isInSharedFolder={isInSharedFolder}
        isAIAgentsFolder={isAIAgentsFolder}
        hideColumns={hideColumns}
        isHighlight={
          highlightFile.id == item.id
            ? highlightFile.isExst === !item.fileExst
            : null
        }
        isTutorialEnabled={isTutorialEnabled}
        setRefMap={setRefMap}
        deleteRefMap={deleteRefMap}
        selectedFolderTitle={selectedFolderTitle}
        canCreateSecurity={canCreateSecurity}
        setDropTargetPreview={setDropTargetPreview}
        disableDrag={disableDrag}
      />
    ));
  }, [
    list,
    setFirsElemChecked,
    setHeaderBorder,
    theme,
    tagCount,
    isRooms,
    isAIAgentsFolder,
    hideColumns,
    highlightFile.id,
    highlightFile.isExst,
    isTrashFolder,
    isIndexEditingMode,
    isIndexing,
    isTutorialEnabled,
    setRefMap,
    deleteRefMap,
    disableDrag,
  ]);

  return (
    <TableContainer
      className={classNames(styles.tableContainer, {
        [styles.isIndexEditingMode]: isIndexEditingMode,
      })}
      noSelect={!withContentSelection}
      useReactWindow
      forwardedRef={ref}
    >
      <TableHeader
        sectionWidth={sectionWidth}
        containerRef={ref}
        tagRef={onSetTagRef}
        setHideColumns={setHideColumns}
        navigate={navigate}
        location={location}
        isRooms={isRooms}
        isIndexing={isIndexing}
        filesList={list}
      />

      <TableBody
        fetchMoreFiles={fetchMoreFiles}
        columnStorageName={columnStorageName}
        filesLength={list.length}
        hasMoreFiles={hasMoreFiles}
        itemCount={filterTotal}
        useReactWindow
        infoPanelVisible={infoPanelVisible}
        isIndexEditingMode={isIndexEditingMode}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        itemHeight={48}
      >
        {filesListNode}
      </TableBody>
    </TableContainer>
  );
};

export default inject(
  ({
    filesStore,
    infoPanelStore,
    treeFoldersStore,
    tableStore,
    userStore,
    settingsStore,
    guidanceStore,
    indexingStore,
    filesActionsStore,
    selectedFolderStore,
    uploadDataStore,
    hotkeyStore,
  }) => {
    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      isRoomsFolder,
      isArchiveFolder,
      isTrashFolder,
      isTemplatesFolder,
      isFavoritesFolder,
      isSharedWithMeFolder,
      isInSharedFolder,
      isAIAgentsFolder,
    } = treeFoldersStore;
    const isRooms = isRoomsFolder || isArchiveFolder || isTemplatesFolder;

    const { columnStorageName, columnInfoPanelStorageName } = tableStore;

    const {
      viewAs,
      setViewAs,
      setFirsElemChecked,
      setHeaderBorder,
      fetchMoreFiles,
      hasMoreFiles,
      roomsFilter,
      highlightFile,
      filter,
      disableDrag,
    } = filesStore;

    const { isIndexEditingMode } = indexingStore;
    const { changeIndex } = filesActionsStore;
    const {
      isIndexedFolder,
      title: selectedFolderTitle,
      security,
    } = selectedFolderStore;
    const { theme, currentDeviceType } = settingsStore;
    const { setRefMap, deleteRefMap } = guidanceStore;
    const { withContentSelection } = hotkeyStore;

    const { primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;

    const canCreateSecurity = security?.Create;

    return {
      viewAs,
      setViewAs,
      setFirsElemChecked,
      setHeaderBorder,
      theme,
      userId: userStore.user?.id,
      infoPanelVisible,
      fetchMoreFiles,
      hasMoreFiles,
      filterTotal:
        isRooms || isAIAgentsFolder ? roomsFilter.total : filter.total,
      isRooms,
      isTrashFolder,
      isIndexEditingMode,
      isIndexing: isIndexedFolder,
      isTemplatesFolder,
      columnStorageName,
      columnInfoPanelStorageName,
      highlightFile,
      currentDeviceType,
      onEditIndex: changeIndex,
      setRefMap,
      deleteRefMap,
      selectedFolderTitle,
      canCreateSecurity,
      setDropTargetPreview,
      disableDrag,
      withContentSelection,
      isFavoritesFolder,
      isSharedWithMeFolder,
      isInSharedFolder,
      isAIAgentsFolder,
    };
  },
)(withContainer(observer(Table)));
