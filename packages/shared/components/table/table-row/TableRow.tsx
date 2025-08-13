// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useRef, useMemo } from "react";
import classNames from "classnames";

import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { hasOwnProperty } from "../../../utils/object";

import { TableCell } from "../sub-components/table-cell";
import { TableRowProps } from "../Table.types";
import styles from "./TableRow.module.scss";

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
    badgeUrl,
    isIndexEditingMode,
    forwardedRef,
    checked,
    isActive,
    dragging,
    hideColumns,
    onClick,
    onDoubleClick,
    contextMenuCellStyle,
    dataTestId,
    contextMenuTestId,
  } = props;

  const cm = useRef<ContextMenuRefType>(null);
  const row = useRef<HTMLDivElement | null>(null);

  const onContextMenu = (e: React.MouseEvent) => {
    fileContextClick?.(e.button === 2);
    if (cm.current && !cm.current?.menuRef.current) {
      row.current?.click();
    }
    if (cm.current) cm.current.show(e);
  };

  const renderContext =
    hasOwnProperty(props, "contextOptions") &&
    contextOptions &&
    contextOptions.length > 0;

  const getOptions = () => {
    fileContextClick?.();
    return contextOptions || [];
  };

  const tableRowClasses = classNames(
    styles.tableRow,
    className,
    "table-container_row",
    checked ? "checked" : "",
    {
      [styles.isIndexEditingMode]: isIndexEditingMode,
      [styles.isActive]: isActive,
      [styles.checked]: checked,
      [styles.dragging]: dragging,
      [styles.hideColumns]: hideColumns,
    },
  );

  return (
    <div
      onContextMenu={onContextMenu}
      className={tableRowClasses}
      ref={forwardedRef}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={dataTestId ?? "table-row"}
    >
      {children}
      {isIndexEditingMode ? null : (
        <div className="context-menu-container">
          <TableCell
            {...selectionProp}
            forwardedRef={row}
            className={classNames(
              selectionProp?.className,
              "table-container_row-context-menu-wrapper",
            )}
            style={contextMenuCellStyle}
          >
            <>
              <ContextMenu
                onHide={onHideContextMenu}
                ref={cm}
                model={contextOptions || []}
                getContextModel={getContextModel}
                withBackdrop
                badgeUrl={badgeUrl}
                dataTestId={contextMenuTestId}
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
            </>
          </TableCell>
        </div>
      )}
    </div>
  );
};

export { TableRow };
