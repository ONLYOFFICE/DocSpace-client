import React from "react";

import SortDescReactSvgUrl from "PUBLIC_DIR/images/sort.desc.react.svg?url";
import { Checkbox } from "../../checkbox";

import { Text } from "../../text";
import { IconButton } from "../../icon-button";
import { globalColors } from "../../../themes";

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
  const { title, enable, active, minWidth, withTagRef, checkbox } = column;

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
      showIcon={!!column.onClick}
      className="table-container_header-cell"
      id={`column_${index}`}
      data-enable={enable}
      data-min-width={minWidth}
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
