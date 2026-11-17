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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";

import { TableCell } from "@onlyoffice/apps-ui-kit/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import { VectorizationStatus } from "@docspace/shared/enums";

import KnowledgeBaseStatusBadge from "SRC_DIR/components/KnowledgeBaseStatusBadge";
import {
  getKnowledgeBaseStatus,
  KNOWLEDGE_BASE_REREAD_MS,
} from "SRC_DIR/store/KnowledgeBasesStore";

import FileNameCell from "./FileNameCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

import styles from "./CellStyles.module.scss";

/**
 * A row of the Knowledge bases list: the base's name, marked while its
 * files are being indexed or when some could not be, its owner and when it
 * was last modified. How far a base is indexed is read from its files by
 * the knowledge bases store.
 */
const KnowledgeBasesRowDataComponent = (props) => {
  const {
    ownerKnowledgeBasesColumnIsEnabled,
    activityKnowledgeBasesColumnIsEnabled,

    dragStyles,
    selectionProp,
    value,
    theme,
    onContentFileSelect,
    checkedProps,
    element,
    inProgress,
    badgesComponent,
    quickButtonsComponent,
    item,
    tableStorageName,
    index,
    t,
    state,
    fetchState,
  } = props;

  const { id, filesCount } = item;

  React.useEffect(() => {
    fetchState({ id, filesCount });
  }, [fetchState, id, filesCount]);

  // Indexing ends without the room changing: a base being indexed is read
  // again while its row is shown.
  const isIndexing =
    getKnowledgeBaseStatus(state) === VectorizationStatus.InProgress;
  React.useEffect(() => {
    if (!isIndexing) return undefined;
    const timer = setInterval(
      () => fetchState({ id, filesCount }, true),
      KNOWLEDGE_BASE_REREAD_MS,
    );
    return () => clearInterval(timer);
  }, [isIndexing, fetchState, id, filesCount]);

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

  const sideColor = theme.filesSection.tableView.row.sideColor;

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`knowledge-bases-cell-name-${index}`}
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
          displayFileExtension={props.displayFileExtension}
        />
        <StyledBadgesContainer>
          <KnowledgeBaseStatusBadge
            status={getKnowledgeBaseStatus(state)}
            themeIsBase={theme.isBase}
            className={styles.knowledgeStatus}
          />
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {ownerKnowledgeBasesColumnIsEnabled ? (
        <TableCell
          dataTestId={`knowledge-bases-cell-owner-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "OwnerKnowledgeBases" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={sideColor}
            fileOwner={props.fileOwner}
            item={item}
          />
          {lastColumn === "OwnerKnowledgeBases"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}

      {activityKnowledgeBasesColumnIsEnabled ? (
        <TableCell
          dataTestId={`knowledge-bases-cell-activity-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ActivityKnowledgeBases" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={sideColor}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
          />
          {lastColumn === "ActivityKnowledgeBases"
            ? quickButtonsComponentNode
            : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore, knowledgeBasesStore }, { item }) => {
  const {
    ownerKnowledgeBasesColumnIsEnabled,
    activityKnowledgeBasesColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    ownerKnowledgeBasesColumnIsEnabled,
    activityKnowledgeBasesColumnIsEnabled,
    tableStorageName,
    state: knowledgeBasesStore.get(item),
    fetchState: knowledgeBasesStore.fetch,
  };
})(observer(KnowledgeBasesRowDataComponent));
