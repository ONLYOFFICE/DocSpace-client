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

export default inject(
  ({ filesStore, settingsStore, infoPanelStore, treeFoldersStore }) => {
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
    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { isRoomsFolder, isArchiveFolder, isTrashFolder } = treeFoldersStore;
    const { withPaging, currentDeviceType } = settingsStore;

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
  },
)(observer(FilesRowContainer));
