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

import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/ui-kit/components/table";
import { IndexIconButtons } from "@docspace/ui-kit/components/rows";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import { VDRIndexingAction } from "@docspace/shared/enums";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import IndexCell from "./IndexCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

const IndexRowDataComponent = (props) => {
  const {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,

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
    isIndexEditingMode,
    changeIndex,
    index,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);

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
        className={classNames(
          selectionProp?.className,
          "table-container_index-cell",
        )}
        style={dragStyles.style}
        value={value}
        dataTestId={`index_cell_order_${index}`}
      >
        <IndexCell
          sideColor={theme.filesSection.tableView.row.sideColor}
          {...props}
        />
      </TableCell>

      <TableCell
        {...dragStyles}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
          lastColumn === "Name" && isIndexEditingMode
            ? "index-buttons-name"
            : "",
        )}
        value={value}
        dataTestId={`index_cell_name_${index}`}
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

      {authorVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorIndexing" ? "no-extra-space" : "",
            lastColumn === "AuthorIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_author_${index}`}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "AuthorIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {createdVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "CreatedIndexing" ? "no-extra-space" : "",
            lastColumn === "CreatedIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_created_${index}`}
        >
          <DateCell
            create
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "CreatedIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedIndexing" ? "no-extra-space" : "",
            lastColumn === "ModifiedIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_modified_${index}`}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "ModifiedIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeIndexing" ? "no-extra-space" : "",
            lastColumn === "SizeIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_size_${index}`}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "SizeIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {typeVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeIndexing" ? "no-extra-space" : "",
            lastColumn === "TypeIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_type_${index}`}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "TypeIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,
    tableStorageName,
  };
})(observer(IndexRowDataComponent));
