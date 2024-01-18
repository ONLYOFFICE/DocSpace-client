import styled from "styled-components";
import { useMemo } from "react";
import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Base } from "@docspace/shared/themes";
import { RowContainer } from "@docspace/shared/components/row-container";

import SimpleFilesRow from "./SimpleFilesRow";

const StyledRowContainer = styled(RowContainer)`
  .row-list-item:first-child {
    .row-wrapper {
      height: 57px;

      margin-top: 1px;
      border-top: 1px solid transparent;

      .styled-checkbox-container {
        padding-bottom: 5px;
      }

      .row_content {
        padding-bottom: 5px;
      }
    }
  }

  .row-list-item {
    margin-top: -1px;
  }
`;

StyledRowContainer.defaultProps = { theme: Base };

const FilesRowContainer = ({
  filesList,
  sectionWidth,
  viewAs,
  setViewAs,
  infoPanelVisible,
  filterTotal,
  fetchMoreFiles,
  hasMoreFiles,
  isRooms,
  isTrashFolder,
  withPaging,
  highlightFile,
  currentDeviceType,
}) => {
  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const filesListNode = useMemo(() => {
    return filesList.map((item, index) => (
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
        isHighlight={
          highlightFile.id == item.id && highlightFile.isExst === !item.fileExst
        }
      />
    ));
  }, [
    filesList,
    sectionWidth,
    isRooms,
    highlightFile.id,
    highlightFile.isExst,
    isTrashFolder,
  ]);

  return (
    <StyledRowContainer
      className="files-row-container"
      filesLength={filesList.length}
      itemCount={filterTotal}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasMoreFiles}
      draggable
      useReactWindow={!withPaging}
      itemHeight={58}
    >
      {filesListNode}
    </StyledRowContainer>
  );
};

export default inject(({ filesStore, auth, treeFoldersStore }) => {
  const {
    filesList,
    viewAs,
    setViewAs,
    filterTotal,
    fetchMoreFiles,
    hasMoreFiles,
    roomsFilterTotal,
    highlightFile,
  } = filesStore;
  const { isVisible: infoPanelVisible } = auth.infoPanelStore;
  const { isRoomsFolder, isArchiveFolder, isTrashFolder } = treeFoldersStore;
  const { withPaging, currentDeviceType } = auth.settingsStore;

  const isRooms = isRoomsFolder || isArchiveFolder;

  return {
    filesList,
    viewAs,
    setViewAs,
    infoPanelVisible,
    filterTotal: isRooms ? roomsFilterTotal : filterTotal,
    fetchMoreFiles,
    hasMoreFiles,
    isRooms,
    isTrashFolder,
    withPaging,
    highlightFile,
    currentDeviceType,
  };
})(observer(FilesRowContainer));
