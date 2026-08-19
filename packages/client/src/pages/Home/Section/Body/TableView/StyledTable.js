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

import classNames from "classnames";
import { TableRow } from "@docspace/ui-kit/components/table";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";

import styles from "./StyledTable.module.scss";

const StyledTableRow = ({
  className = "",
  checked,
  isActive,
  isDragging,
  dragging,
  isRoom,
  isHighlight,
  isIndexUpdated,
  isIndexEditingMode,
  isIndexing,
  showHotkeyBorder,
  inProgress,
  isThirdPartyFolder,
  canDrag,
  isBlockingOperation,
  ...props
}) => (
  <TableRow
    className={classNames(
      styles.styledTableRow,
      {
        [styles.checked]: checked,
        [styles.active]: isActive,
        [styles.isDragging]: isDragging,
        [styles.isRoom]: isRoom,
        [styles.isHighlight]: isHighlight,
        [styles.isIndexUpdated]: isIndexUpdated,
        [styles.isIndexEditingMode]: isIndexEditingMode,
        [styles.isIndexing]: isIndexing,
        [styles.showHotkeyBorder]: showHotkeyBorder,
        [styles.canDrag]: !isThirdPartyFolder && canDrag,
        [styles.isBlockingOperation]: isBlockingOperation,
        [styles.inProgress]: inProgress,
      },
      className,
    )}
    checked={checked}
    isActive={isActive}
    dragging={dragging}
    isIndexEditingMode={isIndexEditingMode}
    {...props}
  />
);

const StyledDragAndDrop = ({ className = "", ...props }) => (
  <DragAndDrop
    className={classNames(styles.styledDragAndDrop, className)}
    {...props}
  />
);

const StyledBadgesContainer = ({ className = "", ...props }) => (
  <div className={classNames(styles.styledBadgesContainer, className)} {...props} />
);

const StyledQuickButtonsContainer = ({ className = "", ...props }) => (
  <div
    className={classNames(styles.styledQuickButtonsContainer, className)}
    {...props}
  />
);

export {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
  StyledTableRow,
  StyledDragAndDrop,
};
