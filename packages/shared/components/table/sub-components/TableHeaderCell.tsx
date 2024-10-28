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

import SortDescReactSvgUrl from "PUBLIC_DIR/images/sort.desc.react.svg?url";
import { Checkbox } from "../../checkbox";

import { Text } from "../../text";
import { IconButton } from "../../icon-button";
import { globalColors } from "../../../themes/globalColors";

import { StyledTableHeaderCell } from "../Table.styled";
import { TableHeaderCellProps } from "../Table.types";

const TableHeaderCell = ({
  column,
  index,
  onMouseDown,
  resizable,
  sortBy,
  sorted,
  defaultSize,
  sortingVisible,
  tagRef,
}: TableHeaderCellProps) => {
  const {
    title,
    enable,
    active,
    minWidth,
    withTagRef,
    default: isDefault,
    checkbox,
    isShort,
  } = column;

  const isActive = (sortBy && column.sortBy === sortBy) || active;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!sortingVisible) return;
    column.onClick?.(column.sortBy || "", e);
  };

  const onIconClick = (e: React.MouseEvent) => {
    if (!sortingVisible) return;
    column.onIconClick?.();
    e.stopPropagation();
  };

  return withTagRef ? (
    <StyledTableHeaderCell
      sorted={sorted}
      isActive={isActive}
      isShort={isShort}
      showIcon={!!column.onClick}
      className="table-container_header-cell"
      id={`column_${index}`}
      data-default={isDefault}
      data-enable={enable}
      data-min-width={minWidth}
      data-short-colum={isShort}
      data-default-size={defaultSize}
      sortingVisible={sortingVisible}
      ref={tagRef}
    >
      <div className="table-container_header-item">
        <div className="header-container-text-wrapper" onClick={onClick}>
          <Text fontWeight={600} className="header-container-text">
            {enable ? title : ""}
          </Text>

          {sortingVisible && (
            <IconButton
              onClick={column.onIconClick ? onIconClick : onClick}
              iconName={SortDescReactSvgUrl}
              className="header-container-text-icon"
              size={12}
              color={isActive ? globalColors.grayMain : globalColors.gray}
            />
          )}
        </div>
        {resizable && (
          <div
            data-column={`${index}`}
            className="resize-handle not-selectable"
            onMouseDown={onMouseDown}
          />
        )}
      </div>
    </StyledTableHeaderCell>
  ) : (
    <StyledTableHeaderCell
      sorted={sorted}
      isActive={isActive}
      showIcon={!!column.onClick}
      className="table-container_header-cell"
      id={`column_${index}`}
      data-enable={enable}
      data-default={isDefault}
      data-short-colum={isShort}
      data-min-width={minWidth}
      data-default-size={defaultSize}
      sortingVisible={sortingVisible}
    >
      <div className="table-container_header-item">
        <div className="header-container-text-wrapper" onClick={onClick}>
          {checkbox && (checkbox.isIndeterminate || checkbox.value) && (
            <Checkbox
              onChange={checkbox.onChange}
              isChecked={checkbox.value}
              isIndeterminate={checkbox.isIndeterminate}
            />
          )}

          <Text fontWeight={600} className="header-container-text">
            {enable ? title : ""}
          </Text>

          {sortingVisible && (
            <IconButton
              onClick={column.onIconClick ? onIconClick : onClick}
              iconName={SortDescReactSvgUrl}
              className="header-container-text-icon"
              size={12}
              color={isActive ? globalColors.grayMain : globalColors.gray}
            />
          )}
        </div>
        {resizable && (
          <div
            data-column={`${index}`}
            className="resize-handle not-selectable"
            onMouseDown={onMouseDown}
          />
        )}
      </div>
    </StyledTableHeaderCell>
  );
};

export { TableHeaderCell };
