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
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { classNames, getLastColumn } from "@docspace/shared/utils";

import FileNameCell from "./FileNameCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

import styles from "./CellStyles.module.scss";

/**
 * A row of the Skill sets list: the set's name, how many skills it holds
 * (its Markdown files: a set has no folders), how many agents use it, its
 * owner and when it was last modified.
 */
const SkillSetsRowDataComponent = (props) => {
  const {
    skillsSkillSetsColumnIsEnabled,
    usedBySkillSetsColumnIsEnabled,
    ownerSkillSetsColumnIsEnabled,
    activitySkillSetsColumnIsEnabled,

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
  } = props;

  // The header stores the columns only once it is drawn, after the first
  // rows; until then the quick buttons go in the last column switched on, or
  // a list opened for the first time would never show them.
  const storageColumns = localStorage.getItem(tableStorageName);
  const lastColumn = useMemo(
    () =>
      getLastColumn(tableStorageName) ??
      (activitySkillSetsColumnIsEnabled
        ? "ActivitySkillSets"
        : ownerSkillSetsColumnIsEnabled
          ? "OwnerSkillSets"
          : usedBySkillSetsColumnIsEnabled
            ? "UsedBySkillSets"
            : skillsSkillSetsColumnIsEnabled
              ? "SkillsSkillSets"
              : "Name"),
    [
      tableStorageName,
      storageColumns,
      skillsSkillSetsColumnIsEnabled,
      usedBySkillSetsColumnIsEnabled,
      ownerSkillSetsColumnIsEnabled,
      activitySkillSetsColumnIsEnabled,
    ],
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
        dataTestId={`skill-sets-cell-name-${index}`}
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
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {skillsSkillSetsColumnIsEnabled ? (
        <TableCell
          dataTestId={`skill-sets-cell-skills-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SkillsSkillSets" ? "no-extra-space" : "",
          )}
        >
          <Text
            fontSize="12px"
            fontWeight={600}
            color={sideColor}
            className={styles.styledText}
            truncate
          >
            {item.filesCount ?? 0}
          </Text>
          {lastColumn === "SkillsSkillSets" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {usedBySkillSetsColumnIsEnabled ? (
        <TableCell
          dataTestId={`skill-sets-cell-used-by-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "UsedBySkillSets" ? "no-extra-space" : "",
          )}
        >
          <Text
            fontSize="12px"
            fontWeight={600}
            color={sideColor}
            className={styles.styledText}
            truncate
          >
            {item.linkedProjectsCount ?? 0}
          </Text>
          {lastColumn === "UsedBySkillSets" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {ownerSkillSetsColumnIsEnabled ? (
        <TableCell
          dataTestId={`skill-sets-cell-owner-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "OwnerSkillSets" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={sideColor}
            fileOwner={props.fileOwner}
            item={item}
          />
          {lastColumn === "OwnerSkillSets" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {activitySkillSetsColumnIsEnabled ? (
        <TableCell
          dataTestId={`skill-sets-cell-activity-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ActivitySkillSets" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={sideColor}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
          />
          {lastColumn === "ActivitySkillSets"
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
    skillsSkillSetsColumnIsEnabled,
    usedBySkillSetsColumnIsEnabled,
    ownerSkillSetsColumnIsEnabled,
    activitySkillSetsColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    skillsSkillSetsColumnIsEnabled,
    usedBySkillSetsColumnIsEnabled,
    ownerSkillSetsColumnIsEnabled,
    activitySkillSetsColumnIsEnabled,
    tableStorageName,
  };
})(observer(SkillSetsRowDataComponent));
