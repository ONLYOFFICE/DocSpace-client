// (c) Copyright Ascensio System SIA 2009-2024
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
import FileNameCell from "./FileNameCell";
import TypeCell from "./TypeCell";
import AuthorCell from "./AuthorCell";
import ContentCell from "./ContentCell";
import { classNames } from "@docspace/shared/utils";
import { StyledBadgesContainer } from "../StyledTable";
import { StyledQuickButtonsContainer } from "../StyledTable";

const TemplatesRowData = (props) => {
  const {
    t,
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    contentColumnsIsEnabled,

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
    item,
  } = props;

  return (
    <>
      <TableCell
        {...dragStyles}
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

      {roomColumnTypeIsEnabled ? (
        <TableCell
          style={
            !roomColumnTypeIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {contentColumnsIsEnabled ? (
        <TableCell
          style={
            !contentColumnsIsEnabled ? { background: "none" } : dragStyles.style
          }
          {...selectionProp}
        >
          <ContentCell
            t={t}
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnOwnerIsEnabled ? (
        <TableCell
          style={
            !roomColumnOwnerIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
        >
          <AuthorCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnQuickButtonsIsEnabled ? (
        <TableCell
          style={
            !roomColumnQuickButtonsIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            "table-container_quick-buttons-wrapper",
          )}
        >
          <StyledQuickButtonsContainer>
            {quickButtonsComponent}
          </StyledQuickButtonsContainer>
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ currentQuotaStore, tableStore }) => {
  const {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    contentColumnsIsEnabled,
  } = tableStore;

  return {
    roomColumnTypeIsEnabled,
    roomColumnOwnerIsEnabled,
    roomColumnQuickButtonsIsEnabled,
    contentColumnsIsEnabled,
  };
})(observer(TemplatesRowData));