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
import { TableCell } from "@docspace/shared/components/table";
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
