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

import React, { useEffect, useState } from "react";
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
import SizeCell from "./SizeCell";
import LocationCell from "./LocationCell";
import DateCell from "./DateCell";

const FavoritesRowDataComponent = (props) => {
  const {
    locationFavoritesColumnIsEnabled,
    authorFavoritesColumnIsEnabled,
    sizeFavoritesColumnIsEnabled,
    typeFavoritesColumnIsEnabled,
    modifiedFavoritesColumnIsEnabled,
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

  const [lastColumn, setLastColumn] = useState(getLastColumn(tableStorageName));

  useEffect(() => {
    if (!lastColumn) setLastColumn(getLastColumn(tableStorageName));
  }, [lastColumn, tableStorageName]);

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`favorites-cell-name-${index}`}
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

      {authorFavoritesColumnIsEnabled ? (
        <TableCell
          dataTestId={`favorites-cell-author-${index}`}
          style={
            !authorFavoritesColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorFavorites" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "AuthorFavorites" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {locationFavoritesColumnIsEnabled ? (
        <TableCell
          dataTestId={`favorites-cell-location-${index}`}
          style={
            !locationFavoritesColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorFavorites" ? "no-extra-space" : "",
          )}
        >
          <LocationCell
            item={item}
            sideColor={theme.filesSection.tableView.row.sideColor}
          />
          {lastColumn === "LocationFavorites"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedFavoritesColumnIsEnabled ? (
        <TableCell
          dataTestId={`favorites-cell-modified-${index}`}
          style={
            !modifiedFavoritesColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedFavorites" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "ModifiedFavorites"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeFavoritesColumnIsEnabled ? (
        <TableCell
          dataTestId={`favorites-cell-size-${index}`}
          style={
            !sizeFavoritesColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeFavorites" ? "no-extra-space" : "",
          )}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "SizeFavorites" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {typeFavoritesColumnIsEnabled ? (
        <TableCell
          dataTestId={`favorites-cell-type-${index}`}
          style={
            !typeFavoritesColumnIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeFavorites" ? "no-extra-space" : "",
          )}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "TypeFavorites" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    locationFavoritesColumnIsEnabled,
    authorFavoritesColumnIsEnabled,
    sizeFavoritesColumnIsEnabled,
    typeFavoritesColumnIsEnabled,
    modifiedFavoritesColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    locationFavoritesColumnIsEnabled,
    authorFavoritesColumnIsEnabled,
    sizeFavoritesColumnIsEnabled,
    typeFavoritesColumnIsEnabled,
    modifiedFavoritesColumnIsEnabled,
    tableStorageName,
  };
})(observer(FavoritesRowDataComponent));
