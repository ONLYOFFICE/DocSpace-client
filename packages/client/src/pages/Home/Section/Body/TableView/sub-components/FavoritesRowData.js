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
