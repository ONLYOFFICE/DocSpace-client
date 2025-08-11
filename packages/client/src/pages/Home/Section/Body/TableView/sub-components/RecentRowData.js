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

import { StyledBadgesContainer } from "../StyledTable";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import RoomCell from "./RoomCell";

const RecentRowDataComponent = (props) => {
  const {
    roomRecentColumnIsEnabled,
    authorRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedRecentColumnIsEnabled,

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
    item,
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

      {roomRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-room-${index}`}
          style={
            !roomRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorRecent" ? "no-extra-space" : "",
          )}
        >
          <RoomCell
            item={item}
            sideColor={theme.filesSection.tableView.row.sideColor}
            isRecentFolder
          />
        </TableCell>
      ) : (
        <div />
      )}

      {lastOpenedRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-lastopened-${index}`}
          style={
            !lastOpenedRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "LastOpenedRecent" ? "no-extra-space" : "",
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
    roomRecentColumnIsEnabled,
    authorRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedRecentColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    roomRecentColumnIsEnabled,
    authorRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedRecentColumnIsEnabled,
    tableStorageName,
  };
})(observer(RecentRowDataComponent));
