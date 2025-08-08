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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/shared/components/table";
import { IndexIconButtons } from "@docspace/shared/components/index-icon-buttons";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import { VDRIndexingAction } from "@docspace/shared/enums";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";
import ErasureCell from "./ErasureCell";

const RowDataComponent = (props) => {
  const {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    typeColumnIsEnabled,

    dragStyles,
    selectionProp,
    value,
    theme,
    onContentFileSelect,
    checkedProps,
    element,
    inProgress,
    showHotkeyBorder,
    badgesComponent,
    quickButtonsComponent,

    tableStorageName,
    columnStorageName,
    isIndexEditingMode,
    changeIndex,
    isIndexedFolder,
    erasureColumnIsEnabled,
    index,
  } = props;

  const [lastColumn, setLastColumn] = useState(
    getLastColumn(
      tableStorageName,
      localStorage.getItem(columnStorageName),
      isIndexedFolder,
    ),
  );

  useEffect(() => {
    const newLastColumn = getLastColumn(
      tableStorageName,
      localStorage.getItem(columnStorageName),
      isIndexedFolder,
    );

    if (newLastColumn && newLastColumn !== lastColumn) {
      setLastColumn(newLastColumn);
    }
  });

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const indexComponentNode = (
    <IndexIconButtons
      containerClassName="index-arrows-container"
      style={
        lastColumn === "Name"
          ? { justifyContent: "flex-end", flexGrow: "1" }
          : {}
      }
      commonIconClassName="change-index_icon"
      onUpIndexClick={(e) => changeIndex(e, VDRIndexingAction.HigherIndex)}
      onDownIndexClick={(e) => changeIndex(e, VDRIndexingAction.LowerIndex)}
    />
  );

  const lastColumnContent = isIndexEditingMode
    ? indexComponentNode
    : quickButtonsComponentNode;

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`files-cell-name-${index}`}
        className={classNames(
          "table-container_file-name-cell",
          dragStyles.className,
          {
            "table-container_file-name-cell-first":
              value?.indexOf("first") > -1,
          },
        )}
        value={value}
      >
        <FileNameCell
          theme={theme}
          onContentSelect={onContentFileSelect}
          checked={checkedProps}
          element={element}
          inProgress={inProgress}
          {...props}
        />
        <StyledBadgesContainer showHotkeyBorder={showHotkeyBorder}>
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? lastColumnContent : null}
      </TableCell>

      {authorColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-author-${index}`}
          style={
            !authorColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Author" ? "no-extra-space" : "",
            lastColumn === "Author" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Author" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {createdColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-created-${index}`}
          style={
            !createdColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Created" ? "no-extra-space" : "",
            lastColumn === "Created" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
        >
          <DateCell
            create
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Created" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-modified-${index}`}
          style={
            !modifiedColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Modified" ? "no-extra-space" : "",
            lastColumn === "Modified" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Modified" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {erasureColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-erasure-${index}`}
          style={
            !erasureColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Erasure" ? "no-extra-space" : "",
          )}
        >
          <ErasureCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {sizeColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-size-${index}`}
          style={
            !sizeColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Size" ? "no-extra-space" : "",
            lastColumn === "Size" && isIndexEditingMode ? "index-buttons" : "",
          )}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Size" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {typeColumnIsEnabled ? (
        <TableCell
          dataTestId={`files-cell-type-${index}`}
          style={
            !typeColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Type" ? "no-extra-space" : "",
            lastColumn === "Type" && isIndexEditingMode ? "index-buttons" : "",
          )}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Type" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore, selectedFolderStore }) => {
  const {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    typeColumnIsEnabled,
    tableStorageName,
    columnStorageName,
    erasureColumnIsEnabled,
  } = tableStore;

  const { isIndexedFolder } = selectedFolderStore;

  return {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    typeColumnIsEnabled,
    tableStorageName,
    columnStorageName,

    isIndexedFolder,
    erasureColumnIsEnabled,
  };
})(observer(RowDataComponent));
