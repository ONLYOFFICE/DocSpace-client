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
import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import FileNameCell from "./FileNameCell";
import TagsCell from "./TagsCell";
import AuthorCell from "./AuthorCell";
import DateCell from "./DateCell";
import {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
} from "../StyledTable";
import { TTheme } from "@docspace/ui-kit/providers/theme/themes";
import { TAgent } from "@docspace/shared/api/ai/types";
import { TTranslation } from "@docspace/shared/types";

type AIAgentsRowDataComponentProps = {
  aiAgentColumnTagsIsEnabled: boolean;
  aiAgentColumnOwnerIsEnabled: boolean;
  aiAgentColumnActivityIsEnabled: boolean;
  aiAgentColumnQuotaIsEnable: boolean;
  showStorageInfo: boolean;

  dragStyles: {
    style: React.CSSProperties;
  };
  value: string;
  theme: TTheme;
  onContentFileSelect: (checked: boolean, item: TAgent) => void;
  checkedProps: boolean;
  element: React.ReactNode;
  inProgress: boolean;
  showHotkeyBorder: boolean;
  badgesComponent: React.ReactNode;
  quickButtonsComponent: React.ReactNode;
  item: TAgent;
  tableStorageName: string;
  index: number;
  titleWithoutExt: string;
  t: TTranslation;
  linkStyles: { href: string; onClick: VoidFunction };
  isIndexEditingMode: boolean;
  displayFileExtension: boolean;
  selectionProp: { className: string; value: string; documentTitle: string };
  tagCount: number;
  onSelectTag: VoidFunction;
  fileOwner: string;
  create: string;
  updatedDate: string;
  createdDate: string;
  lastOpenedDate: string;
  isRecentFolder: boolean;
  isHovered: boolean;
  isActive: boolean;
};

const AIAgentsRowDataComponent = (props: AIAgentsRowDataComponentProps) => {
  const {
    aiAgentColumnTagsIsEnabled,
    aiAgentColumnOwnerIsEnabled,
    aiAgentColumnActivityIsEnabled,
    aiAgentColumnQuotaIsEnable,
    showStorageInfo,

    dragStyles,
    value,
    theme,
    onContentFileSelect,
    checkedProps,
    selectionProp,
    badgesComponent,
    quickButtonsComponent,
    item,
    tableStorageName,
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
        dataTestId={`rooms-cell-name-${index}`}
        className="table-container_file-name-cell"
        value={value}
      >
        <FileNameCell<TAgent>
          item={item}
          onContentSelect={onContentFileSelect}
          titleWithoutExt={props.titleWithoutExt}
          linkStyles={props.linkStyles}
          element={props.element}
          checked={checkedProps}
          theme={props.theme}
          t={props.t}
          inProgress={props.inProgress}
          isIndexEditingMode={props.isIndexEditingMode}
          displayFileExtension={props.displayFileExtension}
        />
        <StyledBadgesContainer>{badgesComponent}</StyledBadgesContainer>
        {lastColumn === "Name" ? quickButtonsComponentNode : null}
      </TableCell>

      {aiAgentColumnTagsIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-tags-${index}`}
          style={
            !aiAgentColumnTagsIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TagsCell {...props} />
          {lastColumn === "Tags" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {aiAgentColumnOwnerIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-owner-${index}`}
          style={
            !aiAgentColumnOwnerIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Owner" ? "no-extra-space" : "",
          )}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Owner" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}

      {aiAgentColumnActivityIsEnabled ? (
        <TableCell
          dataTestId={`rooms-cell-activity-${index}`}
          style={
            !aiAgentColumnActivityIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Activity" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {lastColumn === "Activity" ? quickButtonsComponentNode : null}
        </TableCell>
      ) : (
        <div />
      )}
      {showStorageInfo ? (
        aiAgentColumnQuotaIsEnable ? (
          <TableCell
            dataTestId={`rooms-cell-storage-${index}`}
            className="table-cell_Storage/Quota"
            style={
              !aiAgentColumnQuotaIsEnable
                ? { background: "none" }
                : dragStyles.style
            }
          >
            <SpaceQuota
              item={item}
              type="agent"
              isReadOnly={!item?.security?.EditRoom}
            />
            {lastColumn === "Storage" ? quickButtonsComponentNode : null}
          </TableCell>
        ) : (
          <div />
        )
      ) : null}
    </>
  );
};

export default inject(({ currentQuotaStore, tableStore }: TStore) => {
  const {
    aiAgentColumnNameIsEnabled,
    aiAgentColumnTagsIsEnabled,
    aiAgentColumnOwnerIsEnabled,
    aiAgentColumnActivityIsEnabled,
    aiAgentColumnQuotaIsEnable,
    tableStorageName,
  } = tableStore;

  const { showStorageInfo } = currentQuotaStore;
  return {
    aiAgentColumnNameIsEnabled,
    aiAgentColumnTagsIsEnabled,
    aiAgentColumnOwnerIsEnabled,
    aiAgentColumnActivityIsEnabled,
    aiAgentColumnQuotaIsEnable,
    showStorageInfo,
    tableStorageName,
  };
})(observer(AIAgentsRowDataComponent));
