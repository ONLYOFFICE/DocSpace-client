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
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { classNames, getLastColumn } from "@docspace/shared/utils";

import FileNameCell from "./FileNameCell";
import DateCell from "./DateCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";

import styles from "./CellStyles.module.scss";

/**
 * A row of an open skill set: the skill's name, without the extension of its
 * file, what its description says and when it was last modified. The
 * description is in the file's text, read once per version by the skills
 * store.
 */
const SkillsRowDataComponent = (props) => {
  const {
    descriptionSkillColumnIsEnabled,
    modifiedSkillColumnIsEnabled,

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
    skill,
    fetchSkill,
  } = props;

  const { id, version, viewUrl } = item;
  // A saved skill is dropped from the store and read again.
  const hasSkill = !!skill;

  React.useEffect(() => {
    if (!hasSkill) fetchSkill({ id, version, viewUrl });
  }, [fetchSkill, id, version, viewUrl, hasSkill]);

  const lastColumn = getLastColumn(tableStorageName);

  const quickButtonsComponentNode = (
    <StyledQuickButtonsContainer>
      {quickButtonsComponent}
    </StyledQuickButtonsContainer>
  );

  const sideColor = theme.filesSection.tableView.row.sideColor;
  const description = skill?.description ?? "";

  return (
    <>
      <TableCell
        {...dragStyles}
        dataTestId={`skills-cell-name-${index}`}
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
          displayFileExtension={false}
        />
        <StyledBadgesContainer>
          {badgesComponent}
        </StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {descriptionSkillColumnIsEnabled ? (
        <TableCell
          dataTestId={`skills-cell-description-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "DescriptionSkill" ? "no-extra-space" : "",
          )}
        >
          <Text
            title={description}
            fontSize="12px"
            fontWeight={600}
            color={sideColor}
            className={styles.styledText}
            truncate
          >
            {description || null}
          </Text>
          {lastColumn === "DescriptionSkill" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {modifiedSkillColumnIsEnabled ? (
        <TableCell
          dataTestId={`skills-cell-modified-${index}`}
          style={dragStyles.style}
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "ModifiedSkill" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={sideColor}
            updatedDate={props.updatedDate}
            createdDate={props.createdDate}
          />
          {lastColumn === "ModifiedSkill" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore, skillsStore }, { item }) => {
  const {
    descriptionSkillColumnIsEnabled,
    modifiedSkillColumnIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    descriptionSkillColumnIsEnabled,
    modifiedSkillColumnIsEnabled,
    tableStorageName,
    skill: skillsStore.get(item),
    fetchSkill: skillsStore.fetch,
  };
})(observer(SkillsRowDataComponent));
