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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";

import { TableCell } from "@docspace/ui-kit/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import TagsCell from "./TagsCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

const RoomsRowDataComponent = (props) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    roomQuotaColumnIsEnable,
    showStorageInfo,

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
    item,
    tableStorageName,
    index,
    t,
  } = props;

  const storageColumns = localStorage.getItem(tableStorageName);
  const lastColumn = useMemo(
    () => getLastColumn(tableStorageName),
    [tableStorageName, storageColumns],
  );

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`rooms-cell-name-${index}`}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
        )}
        value={value}
      >
        <FileNameCell
          item={item}
          theme={theme}
          onContentSelect={onContentFileSelect}
          checked={checkedProps}
          element={element}
          inProgress={inProgress}
          titleWithoutExt={props.titleWithoutExt}
          linkStyles={props.linkStyles}
          t={t}
          isIndexEditingMode={props.isIndexEditingMode}
          displayFileExtension={props.displayFileExtension}
        />
        <StyledBadgesContainer showHotkeyBorder={showHotkeyBorder}>
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {roomColumnTypeIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-type-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Type" ? "no-extra-space" : "",
          )}
        >
          <TypeCell
            t={t}
            item={item}
            sideColor={theme.filesSection.tableView.row.sideColor}
          />
          {lastColumn === "Type" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnTagsIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-tags-${index}`}
          style={dragStyles.style}
          {...selectionProp}
        >
          <TagsCell
            item={props.item}
            tagCount={props.tagCount}
            onSelectTag={props.onSelectTag}
            checkedProps={checkedProps}
            isActive={props.isActive}
            isHovered={props.isHovered}
            sideColor={theme.filesSection.tableView.row.sideColor}
            isAdmin={props.isAdmin}
          />
          {lastColumn === "Tags" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnOwnerIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-owner-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Owner" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            fileOwner={props.fileOwner}
            item={item}
          />
          {lastColumn === "Owner" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnActivityIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-activity-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Activity" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            create={props.create}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
            lastOpenedDate={props.lastOpenedDate}
            isRecentFolder={props.isRecentFolder}
          />
          {lastColumn === "Activity" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}
      {showStorageInfo ? (
        roomQuotaColumnIsEnable ? (
          <TableCell
            dataTestId={`rooms-cell-storage-${index}`}
            className="table-cell_Storage/Quota"
            style={dragStyles.style}
          >
            <SpaceQuota
              item={item}
              type="room"
              isReadOnly={!item?.security?.EditRoom}
            />
            {lastColumn === "Storage" ? quickButtonsComponentNode : null}
          </TableCell>
        ) : (
          <div />
        )
      ) : null}
    </>
  );
};

export default inject(({ currentQuotaStore, tableStore }) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    roomQuotaColumnIsEnable,
    tableStorageName,
  } = tableStore;

  const { showStorageInfo } = currentQuotaStore;
  return {
    roomQuotaColumnIsEnable,
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnTagsIsEnabled,
    roomColumnActivityIsEnabled,
    showStorageInfo,
    tableStorageName,
  };
})(observer(RoomsRowDataComponent));
