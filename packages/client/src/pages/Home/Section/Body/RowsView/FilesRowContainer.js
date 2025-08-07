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

import { useMemo, use } from "react";
import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Context } from "@docspace/shared/utils";
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
    const { isRoomsFolder, isArchiveFolder, isTrashFolder } = treeFoldersStore;
    const { currentDeviceType } = settingsStore;
    const { isIndexEditingMode } = indexingStore;

    const { primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const canCreateSecurity = security?.Create;

    return {
      viewAs,
      setViewAs,
      infoPanelVisible,
      filterTotal: isRooms ? roomsFilter.total : filter.total,
      fetchMoreFiles,
      hasMoreFiles,
      isRooms,
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
    };
  },
)(withContainer(observer(FilesRowContainer)));
