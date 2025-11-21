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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";

import { TableCell } from "@docspace/shared/components/table";
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
            sideColor={theme.filesSection.tableView.row.sideColor}
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
