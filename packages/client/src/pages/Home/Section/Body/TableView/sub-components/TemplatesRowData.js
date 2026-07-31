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
import { classNames, getLastColumn } from "@docspace/shared/utils";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";
import TagsCell from "./TagsCell";
import DateCell from "./DateCell";

const TemplatesRowData = (props) => {
  const {
    templatesRoomColumnTypeIsEnabled,
    templateRoomColumnTagsIsEnabled,
    templatesRoomColumnOwnerIsEnabled,
    templateRoomColumnActivityIsEnabled,
    templateRoomQuotaColumnIsEnable,
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
    tableStorageName,
    index,
    item,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);
  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`templates-cell-name-${index}`}
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
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {templatesRoomColumnTypeIsEnabled ? (
        <TableCell
          dataTestId={`templates-cell-type-${index}`}
          style={
            !templatesRoomColumnTypeIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "TypeTemplates" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {templateRoomColumnTagsIsEnabled ? (
        <TableCell
          dataTestId={`templates-cell-tags-${index}`}
          style={
            !templateRoomColumnTagsIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TagsCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "TagsTemplates" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {templatesRoomColumnOwnerIsEnabled ? (
        <TableCell
          dataTestId={`templates-cell-owner-${index}`}
          style={
            !templatesRoomColumnOwnerIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "OwnerTemplates" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {templateRoomColumnActivityIsEnabled ? (
        <TableCell
          style={
            !templateRoomColumnActivityIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ActivityTemplates" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "ActivityTemplates"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}
      {showStorageInfo ? (
        templateRoomQuotaColumnIsEnable ? (
          <TableCell className="table-cell_Storage/Quota">
            <SpaceQuota
              item={item}
              type="room"
              isReadOnly={!item?.security?.EditRoom}
            />
            {lastColumn === "StorageTemplates"
              ? quickButtonsComponentNode
              : null}
          </TableCell>
        ) : (
          <div />
        )
      ) : null}
    </>
  );
};

export default inject(({ tableStore, currentQuotaStore }) => {
  const {
    tableStorageName,
    templatesRoomColumnTypeIsEnabled,
    templateRoomColumnTagsIsEnabled,
    templatesRoomColumnOwnerIsEnabled,
    templateRoomColumnActivityIsEnabled,
    templateRoomQuotaColumnIsEnable,
  } = tableStore;

  const { showStorageInfo } = currentQuotaStore;

  return {
    tableStorageName,
    templatesRoomColumnTypeIsEnabled,
    templateRoomColumnTagsIsEnabled,
    templatesRoomColumnOwnerIsEnabled,
    templateRoomColumnActivityIsEnabled,
    templateRoomQuotaColumnIsEnable,
    showStorageInfo,
  };
})(observer(TemplatesRowData));
