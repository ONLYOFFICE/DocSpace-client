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

import React from "react";
import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/shared/components/table";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import IndexCell from "./IndexCell";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import { RoomsType } from "@docspace/shared/enums";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow2.react.svg?url";
import { VDRIndexingAction } from "@docspace/shared/enums";

const RowDataComponent = (props) => {
  const {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    typeColumnIsEnabled,
    indexColumnIsEnabled,
    quickButtonsColumnIsEnabled,

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

    isIndexing,
    tableStorageName,
    isIndexEditingMode,
    changeIndex,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);
  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const indexComponentNode = (
    <div
      className="index-arrows-container"
      style={
        lastColumn === "Name"
          ? { display: "flex", justifyContent: "flex-end", flexGrow: "1" }
          : { display: "flex" }
      }
    >
      <ColorTheme
        themeId={ThemeId.IndexIconButton}
        iconName={ArrowReactSvgUrl}
        className="index-up-icon change-index_icon"
        size="small"
        onClick={(e) => changeIndex(e, VDRIndexingAction.HigherIndex)}
      />
      <ColorTheme
        themeId={ThemeId.IndexIconButton}
        iconName={ArrowReactSvgUrl}
        className="index-down-icon change-index_icon"
        size="small"
        onClick={(e) => changeIndex(e, VDRIndexingAction.LowerIndex)}
      />
    </div>
  );

  const lastColumnContent = isIndexEditingMode
    ? indexComponentNode
    : quickButtonsComponentNode;

  return (
    <>
      {indexColumnIsEnabled && isIndexing && (
        <TableCell
          className={classNames(
            selectionProp?.className,
            "table-container_index-cell",
          )}
          style={
            !indexColumnIsEnabled ? { background: "none" } : dragStyles.style
          }
          value={value}
        >
          <IndexCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      )}

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
        {lastColumn === "Name" ? lastColumnContent : <></>}
      </TableCell>

      {authorColumnIsEnabled ? (
        <TableCell
          style={
            !authorColumnIsEnabled ? { background: "none" } : dragStyles.style
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
          {lastColumn === "Author" ? lastColumnContent : <></>}
        </TableCell>
      ) : (
        <div />
      )}

      {createdColumnIsEnabled ? (
        <TableCell
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
          {lastColumn === "Created" ? lastColumnContent : <></>}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedColumnIsEnabled ? (
        <TableCell
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
          {lastColumn === "Modified" ? lastColumnContent : <></>}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeColumnIsEnabled ? (
        <TableCell
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
          {lastColumn === "Size" ? lastColumnContent : <></>}
        </TableCell>
      ) : (
        <div />
      )}

      {typeColumnIsEnabled ? (
        <TableCell
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
          {lastColumn === "Type" ? lastColumnContent : <></>}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore, indexingStore }) => {
  const {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    indexColumnIsEnabled,
    typeColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorColumnIsEnabled,
    createdColumnIsEnabled,
    modifiedColumnIsEnabled,
    sizeColumnIsEnabled,
    indexColumnIsEnabled,
    typeColumnIsEnabled,
    tableStorageName,
  };
})(observer(RowDataComponent));
