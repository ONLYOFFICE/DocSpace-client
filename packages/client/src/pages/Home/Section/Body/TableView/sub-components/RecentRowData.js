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

import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import LocationCell from "./LocationCell";

const RecentRowDataComponent = (props) => {
  const {
    locationRecentColumnIsEnabled,
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
    quickButtonsComponent,
    tableStorageName,
    item,
    index,
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
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
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
          {lastColumn === "AuthorRecent" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {locationRecentColumnIsEnabled ? (
        <TableCell
          dataTestId={`recent-cell-location-${index}`}
          style={
            !locationRecentColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorRecent" ? "no-extra-space" : "",
          )}
        >
          <LocationCell
            item={item}
            sideColor={theme.filesSection.tableView.row.sideColor}
          />
          {lastColumn === "LocationRecent" ? quickButtonsComponentNode : null}
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
          {lastColumn === "LastOpenedRecent" ? quickButtonsComponentNode : null}
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
          {lastColumn === "SizeRecent" ? quickButtonsComponentNode : null}
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
          {lastColumn === "TypeRecent" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    locationRecentColumnIsEnabled,
    authorRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedRecentColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    locationRecentColumnIsEnabled,
    authorRecentColumnIsEnabled,
    sizeRecentColumnIsEnabled,
    typeRecentColumnIsEnabled,
    lastOpenedRecentColumnIsEnabled,
    tableStorageName,
  };
})(observer(RecentRowDataComponent));
