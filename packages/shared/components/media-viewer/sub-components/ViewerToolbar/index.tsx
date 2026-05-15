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

import React, { useImperativeHandle, useRef, useState, type JSX } from "react";
import classNames from "classnames";
import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";
import styles from "./ViewerToolbar.module.scss";
import { useClickOutside } from "../../../../utils";
import ImageViewerToolbarProps, {
  ToolbarItemType,
} from "./ViewerToolbar.props";

const ViewerToolbar = ({
  ref,
  toolbar,
  className,
  percentValue,
  toolbarEvent,
  generateContextMenu,
  setIsOpenContextMenu,
}: ImageViewerToolbarProps) => {
  const contextMenuRef = useRef<HTMLLIElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(() =>
    Math.round(percentValue * 100),
  );

  useClickOutside(contextMenuRef, () => {
    setIsOpen(false);
  });

  useImperativeHandle(ref, () => {
    return {
      setPercentValue(percentArg: number) {
        setPercent(Math.round(percentArg * 100));
      },
    };
  }, []);

  function getContextMenu(item: ToolbarItemType) {
    const contextMenu = generateContextMenu(isOpen);

    if (!contextMenu) return;

    return (
      <li
        className={styles.toolbarItem}
        ref={contextMenuRef}
        key={item.key}
        onClick={() => {
          setIsOpenContextMenu((open) => !open);
          setIsOpen((open) => !open);
        }}
        data-testid="toolbar-item-context-menu"
        data-key={item.key}
        aria-label="More options"
      >
        <div className="context" style={{ height: "16px" }}>
          <MediaContextMenu />
        </div>
        {contextMenu}
      </li>
    );
  }

  function getPercentCompoent() {
    return (
      <div
        className={styles.zoomPercent}
        data-testid="zoom-percent"
        aria-label={`Zoom level ${percent}%`}
      >
        {`${percent}%`}
      </div>
    );
  }

  function renderToolbarItem(item: ToolbarItemType) {
    if (item.disabled) return null;

    if (item.key === "context-menu") {
      return getContextMenu(item);
    }

    let content: JSX.Element | undefined = item?.render;

    if (item.key === "percent") {
      content = getPercentCompoent();
    }

    return (
      <li
        className={classNames(styles.toolbarItem, {
          [styles.separator]: item.actionType === -1,
          [styles.percent]: item.percent ? percent : 100,
          [styles.disabled]: item.percent ? percent === 25 : false,
        })}
        key={item.key}
        onClick={() => toolbarEvent(item)}
        data-testid={`toolbar-item-${item.key}`}
        data-key={item.key}
      >
        {content}
      </li>
    );
  }

  if (toolbar.length === 0) return null;

  return (
    <div
      className={`${className || ""} ${styles.toolbarWrapper}`}
      data-testid="viewer-toolbar"
      role="toolbar"
      aria-label="Media viewer toolbar"
    >
      <ul className={styles.toolsList}>
        {toolbar.map((item) => renderToolbarItem(item))}
      </ul>
    </div>
  );
};

ViewerToolbar.displayName = "ImageViewerToolba";

export { ViewerToolbar };
