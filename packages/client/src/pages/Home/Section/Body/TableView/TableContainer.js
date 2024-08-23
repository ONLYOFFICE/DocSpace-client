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

import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import elementResizeDetectorMaker from "element-resize-detector";
import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from "react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Base } from "@docspace/shared/themes";
import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";
import { Context } from "@docspace/shared/utils";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

const fileNameCss = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: -24px;
          padding-right: 24px;
        `
      : css`
          margin-left: -24px;
          padding-left: 24px;
        `}
`;

const contextCss = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: -20px;
          padding-left: 20px;
        `
      : css`
          margin-right: -20px;
          padding-right: 20px;
        `}
`;

const StyledTableContainer = styled(TableContainer)`
  .table-row-selected {
    .table-container_file-name-cell {
      ${fileNameCss}
    }

    .table-container_row-context-menu-wrapper {
      ${contextCss}
    }
  }

  .table-row-selected + .table-row-selected {
    .table-row {
      .table-container_file-name-cell,
      .table-container_row-context-menu-wrapper {
        border-image-slice: 1;
      }
      .table-container_file-name-cell {
        ${fileNameCss}
        border-left: 0; //for Safari macOS
        border-right: 0; //for Safari macOS

        border-image-source: ${(props) => `linear-gradient(to right, 
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
      .table-container_row-context-menu-wrapper {
        ${contextCss}

        border-image-source: ${(props) => `linear-gradient(to left,
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
    }
  }

  .files-item:not(.table-row-selected) + .table-row-selected {
    .table-row {
      .table-container_file-name-cell {
        ${fileNameCss}
      }

      .table-container_row-context-menu-wrapper {
        ${contextCss}
      }
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const elementResizeDetector = elementResizeDetectorMaker({
  strategy: "scroll",
  callOnAdd: false,
});

const Table = ({
  filesList,
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
  withPaging,
  columnStorageName,
  columnInfoPanelStorageName,
  highlightFile,
  currentDeviceType,
}) => {
  const [tagCount, setTagCount] = React.useState(null);
  const [hideColumns, setHideColumns] = React.useState(false);

  const { sectionWidth } = useContext(Context);

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
    if (!isRooms) setTagCount(0);
  }, [isRooms]);

  const filesListNode = useMemo(() => {
    return filesList.map((item, index) => (
      <TableRow
        id={`${item?.isFolder ? "folder" : "file"}_${item.id}`}
        key={
          item?.version ? `${item.id}_${item.version}` : `${item.id}_${index}`
        }
        item={item}
        itemIndex={index}
        index={index}
        setFirsElemChecked={setFirsElemChecked}
        setHeaderBorder={setHeaderBorder}
        theme={theme}
        tagCount={tagCount}
        isRooms={isRooms}
        isTrashFolder={isTrashFolder}
        hideColumns={hideColumns}
        isHighlight={
          highlightFile.id == item.id && highlightFile.isExst === !item.fileExst
        }
      />
    ));
  }, [
    filesList,
    setFirsElemChecked,
    setHeaderBorder,
    theme,
    tagCount,
    isRooms,
    hideColumns,
    highlightFile.id,
    highlightFile.isExst,
    isTrashFolder,
  ]);

  return (
    <StyledTableContainer useReactWindow={!withPaging} forwardedRef={ref}>
      <TableHeader
        sectionWidth={sectionWidth}
        containerRef={ref}
        tagRef={onSetTagRef}
        setHideColumns={setHideColumns}
        navigate={navigate}
        location={location}
        isRooms={isRooms}
        filesList={filesList}
      />

      <TableBody
        fetchMoreFiles={fetchMoreFiles}
        columnStorageName={columnStorageName}
        filesLength={filesList.length}
        hasMoreFiles={hasMoreFiles}
        itemCount={filterTotal}
        useReactWindow={!withPaging}
        infoPanelVisible={infoPanelVisible}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        itemHeight={48}
      >
        {filesListNode}
      </TableBody>
    </StyledTableContainer>
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
  }) => {
    const { isVisible: infoPanelVisible } = infoPanelStore;

    const { isRoomsFolder, isArchiveFolder, isTrashFolder } = treeFoldersStore;
    const isRooms = isRoomsFolder || isArchiveFolder;

    const { columnStorageName, columnInfoPanelStorageName } = tableStore;

    const {
      filesList,
      viewAs,
      setViewAs,
      setFirsElemChecked,
      setHeaderBorder,
      fetchMoreFiles,
      hasMoreFiles,
      filterTotal,
      roomsFilterTotal,
      highlightFile,
    } = filesStore;

    const { withPaging, theme, currentDeviceType } = settingsStore;

    return {
      filesList,
      viewAs,
      setViewAs,
      setFirsElemChecked,
      setHeaderBorder,
      theme,
      userId: userStore.user?.id,
      infoPanelVisible,
      fetchMoreFiles,
      hasMoreFiles,
      filterTotal: isRooms ? roomsFilterTotal : filterTotal,
      isRooms,
      isTrashFolder,
      withPaging,
      columnStorageName,
      columnInfoPanelStorageName,
      highlightFile,
      currentDeviceType,
    };
  },
)(observer(Table));
