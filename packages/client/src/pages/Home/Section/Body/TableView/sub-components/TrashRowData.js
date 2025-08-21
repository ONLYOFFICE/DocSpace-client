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
import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/shared/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import { StyledBadgesContainer } from "../StyledTable";
import ErasureCell from "./ErasureCell";
import RoomCell from "./RoomCell";

const TrashRowDataComponent = (props) => {
  const {
    authorTrashColumnIsEnabled,
    createdTrashColumnIsEnabled,
    roomColumnIsEnabled,
    erasureColumnIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
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
    tableStorageName,
    index,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`trash-cell-name-${index}`}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
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
      </TableCell>

      {roomColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-room-${index}`}
          style={
            !roomColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Room" ? "no-extra-space" : "",
          )}
        >
          <RoomCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {authorTrashColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-author-${index}`}
          style={
            !authorTrashColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorTrash" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {createdTrashColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-created-${index}`}
          style={
            !createdTrashColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "CreatedTrash" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            create
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {erasureColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-erasure-${index}`}
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

      {sizeTrashColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-size-${index}`}
          style={
            !sizeTrashColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeTrash" ? "no-extra-space" : "",
          )}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {typeTrashColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-type-${index}`}
          style={
            !typeTrashColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeTrash" ? "no-extra-space" : "",
          )}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    authorTrashColumnIsEnabled,
    createdTrashColumnIsEnabled,
    roomColumnIsEnabled,
    erasureColumnIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorTrashColumnIsEnabled,
    createdTrashColumnIsEnabled,
    roomColumnIsEnabled,
    erasureColumnIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    tableStorageName,
  };
})(observer(TrashRowDataComponent));
