import React from "react";
import PropTypes from "prop-types";
import Text from "../text";
import IconButton from "../icon-button";
import globalColors from "../utils/globalColors";
import { StyledTableHeaderCell } from "./StyledTableContainer";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/sort.desc.re... Remove this comment to see the full error message
import SortDescReactSvgUrl from "PUBLIC_DIR/images/sort.desc.react.svg?url";

const TableHeaderCell = ({
  column,
  index,
  onMouseDown,
  resizable,
  sortBy,
  sorted,
  defaultSize,
  sortingVisible,
  tagRef
}: any) => {
  const { title, enable, active, minWidth, withTagRef } = column;

  const isActive = (sortBy && column.sortBy === sortBy) || active;

  const onClick = (e: any) => {
    e.stopPropagation();

    if (!sortingVisible) return;
    column.onClick && column.onClick(column.sortBy, e);
  };

  const onIconClick = (e: any) => {
    if (!sortingVisible) return;
    column.onIconClick();
    e.stopPropagation();
  };

  return withTagRef ? (
    <StyledTableHeaderCell
      // @ts-expect-error TS(2769): No overload matches this call.
      sorted={sorted}
      isActive={isActive}
      showIcon={column.onClick}
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
          // @ts-expect-error TS(2322): Type '{ children: any; fontWeight: number; classNa... Remove this comment to see the full error message
          <Text fontWeight={600} className="header-container-text">
            {enable ? title : ""}
          </Text>

          {sortingVisible && (
            <IconButton
              // @ts-expect-error TS(2322): Type '{ onClick: (e: any) => void; iconName: any; ... Remove this comment to see the full error message
              onClick={column.onIconClick ? onIconClick : onClick}
              iconName={SortDescReactSvgUrl}
              className="header-container-text-icon"
              size="small"
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
      // @ts-expect-error TS(2769): No overload matches this call.
      sorted={sorted}
      isActive={isActive}
      showIcon={column.onClick}
      className="table-container_header-cell"
      id={`column_${index}`}
      data-enable={enable}
      data-min-width={minWidth}
      data-default-size={defaultSize}
      sortingVisible={sortingVisible}
    >
      <div className="table-container_header-item">
        <div className="header-container-text-wrapper" onClick={onClick}>
          // @ts-expect-error TS(2322): Type '{ children: any; fontWeight: number; classNa... Remove this comment to see the full error message
          <Text fontWeight={600} className="header-container-text">
            {enable ? title : ""}
          </Text>

          {sortingVisible && (
            <IconButton
              // @ts-expect-error TS(2322): Type '{ onClick: (e: any) => void; iconName: any; ... Remove this comment to see the full error message
              onClick={column.onIconClick ? onIconClick : onClick}
              iconName={SortDescReactSvgUrl}
              className="header-container-text-icon"
              size="small"
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

TableHeaderCell.propTypes = {
  column: PropTypes.object,
  index: PropTypes.number,
  onMouseDown: PropTypes.func,
  resizable: PropTypes.bool,
  sorted: PropTypes.bool,
  sortBy: PropTypes.string,
  defaultSize: PropTypes.number,
  sortingVisible: PropTypes.bool,
};

export default TableHeaderCell;
