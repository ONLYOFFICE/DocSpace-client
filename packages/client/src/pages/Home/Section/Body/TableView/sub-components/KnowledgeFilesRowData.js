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

import { TableCell } from "@onlyoffice/apps-ui-kit/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";

import FileNameCell from "./FileNameCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import SizeCell from "./SizeCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

/**
 * A row of an open knowledge base: the file's name, marked while it is
 * being indexed or when it could not be, its size, who added it and when.
 */
const KnowledgeFilesRowDataComponent = (props) => {
  const {
    sizeKnowledgeFileColumnIsEnabled,
    authorKnowledgeFileColumnIsEnabled,
    createdKnowledgeFileColumnIsEnabled,

    dragStyles,
    selectionProp,
    value,
    documentTitle,
    theme,
    onContentFileSelect,
    checkedProps,
    element,
    inProgress,
    badgesComponent,
    quickButtonsComponent,

    tableStorageName,
    index,
    t,
    item,
    linkStyles,
  } = props;

  const lastColumn = getLastColumn(tableStorageName);

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const sideColor = theme.filesSection.tableView.row.sideColor;

  const cellProps = (key, name) => ({
    dataTestId: `knowledge-files-cell-${name}-${index}`,
    style: dragStyles.style,
    ...selectionProp,
    className: classNames(
      selectionProp?.className,
      lastColumn === key ? "no-extra-space" : "",
    ),
  });

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`knowledge-files-cell-name-${index}`}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
          dragStyles.className,
          {
            "table-container_file-name-cell-first":
              value?.indexOf("first") > -1,
          },
        )}
        value={value}
        documentTitle={documentTitle}
      >
        <FileNameCell
          t={t}
          item={item}
          theme={theme}
          element={element}
          checked={checkedProps}
          inProgress={inProgress}
          linkStyles={linkStyles}
          titleWithoutExt={props.titleWithoutExt}
          onContentSelect={onContentFileSelect}
          displayFileExtension={props.displayFileExtension}
        />
        <StyledBadgesContainer>
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {sizeKnowledgeFileColumnIsEnabled ? (
        <TableCell {...cellProps("SizeKnowledgeFile", "size")}>
          <SizeCell sideColor={sideColor} item={item} />
          {lastColumn === "SizeKnowledgeFile"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}

      {authorKnowledgeFileColumnIsEnabled ? (
        <TableCell {...cellProps("AuthorKnowledgeFile", "author")}>
          <AuthorCell
            sideColor={sideColor}
            fileOwner={props.fileOwner}
            item={item}
          />
          {lastColumn === "AuthorKnowledgeFile"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}

      {createdKnowledgeFileColumnIsEnabled ? (
        <TableCell {...cellProps("CreatedKnowledgeFile", "created")}>
          <DateCell
            create
            sideColor={sideColor}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
          />
          {lastColumn === "CreatedKnowledgeFile"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    sizeKnowledgeFileColumnIsEnabled,
    authorKnowledgeFileColumnIsEnabled,
    createdKnowledgeFileColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    sizeKnowledgeFileColumnIsEnabled,
    authorKnowledgeFileColumnIsEnabled,
    createdKnowledgeFileColumnIsEnabled,
    tableStorageName,
  };
})(observer(KnowledgeFilesRowDataComponent));
