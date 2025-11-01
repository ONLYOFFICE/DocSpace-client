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

import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/shared/components/table";
import { IndexIconButtons } from "@docspace/shared/components/index-icon-buttons";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import { VDRIndexingAction } from "@docspace/shared/enums";
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import IndexCell from "./IndexCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

const IndexRowDataComponent = (props) => {
  const {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,

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
    isIndexEditingMode,
    changeIndex,
    index,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const indexComponentNode = (
    <IndexIconButtons
      containerClassName="index-arrows-container"
      style={
        lastColumn === "Name"
          ? { justifyContent: "flex-end", flexGrow: "1" }
          : {}
      }
      commonIconClassName="change-index_icon"
      onUpIndexClick={(e) => changeIndex(e, VDRIndexingAction.HigherIndex)}
      onDownIndexClick={(e) => changeIndex(e, VDRIndexingAction.LowerIndex)}
    />
  );

  const lastColumnContent = isIndexEditingMode
    ? indexComponentNode
    : quickButtonsComponentNode;

  return (
    <>
      <TableCell
        className={classNames(
          selectionProp?.className,
          "table-container_index-cell",
        )}
        style={dragStyles.style}
        value={value}
        dataTestId={`index_cell_order_${index}`}
      >
        <IndexCell
          sideColor={theme.filesSection.tableView.row.sideColor}
          {...props}
        />
      </TableCell>

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
        dataTestId={`index_cell_name_${index}`}
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
        {lastColumn === "Name" ? lastColumnContent : null}
      </TableCell>

      {authorVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "AuthorIndexing" ? "no-extra-space" : "",
            lastColumn === "AuthorIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_author_${index}`}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "AuthorIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {createdVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "CreatedIndexing" ? "no-extra-space" : "",
            lastColumn === "CreatedIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_created_${index}`}
        >
          <DateCell
            create
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "CreatedIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedIndexing" ? "no-extra-space" : "",
            lastColumn === "ModifiedIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_modified_${index}`}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "ModifiedIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeIndexing" ? "no-extra-space" : "",
            lastColumn === "SizeIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_size_${index}`}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "SizeIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}

      {typeVDRColumnIsEnabled ? (
        <TableCell
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "TypeIndexing" ? "no-extra-space" : "",
            lastColumn === "TypeIndexing" && isIndexEditingMode
              ? "index-buttons"
              : "",
          )}
          dataTestId={`index_cell_type_${index}`}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "TypeIndexing" ? lastColumnContent : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    authorVDRColumnIsEnabled,
    modifiedVDRColumnIsEnabled,
    createdVDRColumnIsEnabled,
    sizeVDRColumnIsEnabled,
    typeVDRColumnIsEnabled,
    tableStorageName,
  };
})(observer(IndexRowDataComponent));
