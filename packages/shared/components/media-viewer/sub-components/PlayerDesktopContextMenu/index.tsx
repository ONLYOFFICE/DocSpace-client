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

import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg";
import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";
import styles from "./PlayerDesktopContextMenu.module.scss";

import PlayerDesktopContextMenuProps from "./PlayerDesktopContextMenu.props";

const ContextRight = "9";
const ContextBottom = "48";

const PlayerDesktopContextMenu = memo(
  ({
    canDownload,
    isPreviewFile,
    hideContextMenu,
    onDownloadClick,
    generateContextMenu,
  }: PlayerDesktopContextMenuProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const [isOpenContext, setIsOpenContext] = useState<boolean>(false);

    const context = useMemo(
      () => generateContextMenu(isOpenContext, ContextRight, ContextBottom),
      [generateContextMenu, isOpenContext],
    );

    const toggleContext = () => setIsOpenContext((pre) => !pre);

    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }
        setIsOpenContext(false);
      };
      document.addEventListener("mousedown", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
      };
    }, []);

    if (hideContextMenu && canDownload) {
      return (
        <div
          className={styles.downloadIconWrapper}
          onClick={onDownloadClick}
          data-testid="download-button"
          aria-label="Download file"
        >
          <DownloadReactSvgUrl role="presentation" />
        </div>
      );
    }
    if (isPreviewFile) return;

    if (!context) return;

    return (
      <div
        ref={ref}
        className={styles.playerDesktopContextMenuWrapper}
        onClick={toggleContext}
        data-testid="context-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpenContext}
        aria-label="Open context menu"
      >
        <MediaContextMenu role="presentation" />
        {context}
      </div>
    );
  },
);

PlayerDesktopContextMenu.displayName = "PlayerDesktopContextMenu";

export { PlayerDesktopContextMenu };
