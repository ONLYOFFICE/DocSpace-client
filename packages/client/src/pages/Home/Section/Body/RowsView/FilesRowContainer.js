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

import { useMemo, use } from "react";
import { inject, observer } from "mobx-react";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";

import { Context } from "@docspace/ui-kit/utils/context";
import { FilesRowContainer as RowContainer } from "@docspace/shared/components/files-row";

import withContainer from "../../../../../HOCs/withContainer";

import SimpleFilesRow from "./SimpleFilesRow";

const FilesRowContainer = ({
  list,
  viewAs,
  setViewAs,
  filterTotal,
  fetchMoreFiles,
  hasMoreFiles,
  isRooms,
  isAIAgentsFolder,
  isTrashFolder,
  highlightFile,
  currentDeviceType,
  isIndexEditingMode,
  changeIndex,
  isTutorialEnabled,
  setRefMap,
  deleteRefMap,
  selectedFolderTitle,
  setDropTargetPreview,
  disableDrag,
  canCreateSecurity,
  withContentSelection,
}) => {
  const { sectionWidth } = use(Context);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const filesListNode = useMemo(() => {
    return list.map((item, index) => (
      <SimpleFilesRow
        id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
        key={
          item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
        }
        item={item}
        itemIndex={index}
        sectionWidth={sectionWidth}
        isRooms={isRooms}
        isAIAgentsFolder={isAIAgentsFolder}
        isTrashFolder={isTrashFolder}
        changeIndex={changeIndex}
        isHighlight={
          highlightFile.id == item.id
            ? highlightFile.isExst === !item.fileExst
            : null
        }
        isIndexEditingMode={isIndexEditingMode}
        isTutorialEnabled={isTutorialEnabled}
        setRefMap={setRefMap}
        deleteRefMap={deleteRefMap}
        selectedFolderTitle={selectedFolderTitle}
        setDropTargetPreview={setDropTargetPreview}
        disableDrag={disableDrag}
        canCreateSecurity={canCreateSecurity}
      />
    ));
  }, [
    list,
    sectionWidth,
    isRooms,
    isAIAgentsFolder,
    highlightFile.id,
    highlightFile.isExst,
    isTrashFolder,
    isTutorialEnabled,
  ]);

  return (
    <RowContainer
      className="files-row-container"
      filesLength={list.length}
      itemCount={filterTotal}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasMoreFiles}
      draggable
      useReactWindow
      noSelect={!withContentSelection}
      itemHeight={58}
    >
      {filesListNode}
    </RowContainer>
  );
};

export default inject(
  ({
    filesStore,
    settingsStore,
    infoPanelStore,
    treeFoldersStore,
    indexingStore,
    filesActionsStore,
    guidanceStore,
    selectedFolderStore,
    uploadDataStore,
    hotkeyStore,
  }) => {
    const {
      viewAs,
      setViewAs,
      filter,
      fetchMoreFiles,
      hasMoreFiles,
      roomsFilter,
      highlightFile,
      disableDrag,
    } = filesStore;

    const { title: selectedFolderTitle, security } = selectedFolderStore;
    const { setRefMap, deleteRefMap } = guidanceStore;
    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { isRoomsFolder, isArchiveFolder, isTrashFolder, isAIAgentsFolder } =
      treeFoldersStore;
    const { currentDeviceType } = settingsStore;
    const { isIndexEditingMode } = indexingStore;
    const { withContentSelection } = hotkeyStore;

    const { primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const canCreateSecurity = security?.Create;

    return {
      viewAs,
      setViewAs,
      infoPanelVisible,
      filterTotal:
        isRooms || isAIAgentsFolder ? roomsFilter.total : filter.total,
      fetchMoreFiles,
      hasMoreFiles,
      isRooms,
      isAIAgentsFolder,
      isTrashFolder,
      highlightFile,
      currentDeviceType,
      isIndexEditingMode,
      changeIndex: filesActionsStore.changeIndex,
      setRefMap,
      deleteRefMap,
      selectedFolderTitle,
      setDropTargetPreview,
      disableDrag,
      canCreateSecurity,
      withContentSelection,
    };
  },
)(withContainer(observer(FilesRowContainer)));
