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

const RecentRowDataComponent = (props) => {
  const {
    authorRecentColumnIsEnabled,
    createdRecentColumnIsEnabled,
    modifiedRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedColumnIsEnabled,

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
        dataTestId={`recent-cell-name-${index}`}
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

      {authorRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-author-${index}`}
          style={
            !authorRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorRecent" ? "no-extra-space" : "",
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

      {createdRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-created-${index}`}
          style={
            !createdRecentColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "CreatedRecent" ? "no-extra-space" : "",
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

      {lastOpenedColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-lastopened-${index}`}
          style={
            !lastOpenedColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "LastOpened" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-modified-${index}`}
          style={
            !modifiedRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedRecent" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {sizeRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-size-${index}`}
          style={
            !sizeRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeRecent" ? "no-extra-space" : "",
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

      {typeRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-type-${index}`}
          style={
            !typeRecentColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeRecent" ? "no-extra-space" : "",
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
    authorRecentColumnIsEnabled,
    createdRecentColumnIsEnabled,
    modifiedRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorRecentColumnIsEnabled,
    createdRecentColumnIsEnabled,
    modifiedRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedColumnIsEnabled,
    tableStorageName,
  };
})(observer(RecentRowDataComponent));
