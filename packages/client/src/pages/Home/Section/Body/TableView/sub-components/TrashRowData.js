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

import React from "react";
import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/ui-kit/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import { StyledBadgesContainer } from "../StyledTable";
import ErasureCell from "./ErasureCell";
import LocationCell from "./LocationCell";

const TrashRowDataComponent = (props) => {
  const {
    authorTrashColumnIsEnabled,
    createdTrashColumnIsEnabled,
    locationColumnIsEnabled,
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

      {locationColumnIsEnabled ? (
        <TableCell
          dataTestId={`trash-cell-location-${index}`}
          style={
            !locationColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Location" ? "no-extra-space" : "",
          )}
        >
          <LocationCell
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
    locationColumnIsEnabled,
    erasureColumnIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorTrashColumnIsEnabled,
    createdTrashColumnIsEnabled,
    locationColumnIsEnabled,
    erasureColumnIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    tableStorageName,
  };
})(observer(TrashRowDataComponent));
