import React, { useRef } from "react";

import { ContextMenu } from "../context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../context-menu-button";

import { StyledTableRow } from "./Table.styled";
import { TableRowProps } from "./Table.types";

import { TableCell } from "./sub-components/TableCell";

const TableRow = (props: TableRowProps) => {
  const {
    fileContextClick,
    onHideContextMenu,
    children,
    contextOptions,
    className,
    style,
    selectionProp,
    title,
    getContextModel,
    ...rest
  } = props;

  const cm = useRef<null | {
    show: (e: React.MouseEvent | MouseEvent) => void;
    hide: (
      e:
        | React.MouseEvent
        | MouseEvent
        | Event
        | React.ChangeEvent<HTMLInputElement>,
    ) => void;
  }>(null);
  const row = useRef<HTMLDivElement | null>(null);

  const onContextMenu = (e: React.MouseEvent) => {
    fileContextClick?.(e.button === 2);
    // if (cm.current && !cm.current.menuRef.current) {
    //   row.current.click(e);
    // }
    if (cm.current) cm.current.show(e);
  };

  const renderContext =
    Object.prototype.hasOwnProperty.call(props, "contextOptions") &&
    contextOptions.length > 0;

  const getOptions = () => {
    fileContextClick?.();
    return contextOptions;
  };

  return (
    <StyledTableRow
      onContextMenu={onContextMenu}
      className={`${className} table-container_row`}
      {...rest}
    >
      {children}
      <div>
        <TableCell
          {...selectionProp}
          style={style}
          forwardedRef={row}
          className={`${selectionProp?.className} table-container_row-context-menu-wrapper`}
        >
          <ContextMenu
            onHide={onHideContextMenu}
            ref={cm}
            model={contextOptions}
            getContextModel={getContextModel}
            withBackdrop
          />
          {renderContext ? (
            <ContextMenuButton
              isFill
              className="expandButton"
              getData={getOptions}
              directionX="right"
              displayType={ContextMenuButtonDisplayType.toggle}
              onClick={onContextMenu}
              onClose={onHideContextMenu}
              title={title}
            />
          ) : (
            <div className="expandButton"> </div>
          )}
        </TableCell>
      </div>
    </StyledTableRow>
  );
};

export { TableRow };
