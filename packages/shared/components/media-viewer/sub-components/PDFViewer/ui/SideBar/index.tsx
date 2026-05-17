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

import React, { useState } from "react";
import ViewRowsIcon from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesIcon from "PUBLIC_DIR/images/view-tiles.react.svg";
import ArticleShowMenuReactSvgUrl from "PUBLIC_DIR/images/article-show-menu.react.svg";
import classNames from "classnames";
import { Bookmarks } from "../Bookmarks";
import styles from "../../PDFViewer.module.scss";
import SidebarProps from "./Sidebar.props";

import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";

export const Sidebar = ({
  bookmarks,
  isPanelOpen,
  setIsPDFSidebarOpen,
  navigate,
}: SidebarProps) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const { isRTL } = useInterfaceDirection();
  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  const closeSidebar = () => setIsPDFSidebarOpen(false);

  return (
    <aside
      className={classNames(styles.sidebarContainer, {
        [styles.isPanelOpen]: isPanelOpen,
      })}
      data-testid="pdf-sidebar"
      aria-label="PDF sidebar"
    >
      <div className={styles.sidebarHeader} data-testid="sidebar-header">
        {bookmarks.length > 0
          ? React.createElement(toggle ? ViewTilesIcon : ViewRowsIcon, {
              onClick: handleToggle,
            })
          : null}
        <ArticleShowMenuReactSvgUrl
          className={styles.hideSidebarIcon}
          onClick={closeSidebar}
          data-interface-dir={isRTL ? "rtl" : "ltr"}
          data-testid="close-sidebar-button"
          aria-label="Close sidebar"
        />
      </div>
      {toggle ? (
        <Bookmarks
          bookmarks={bookmarks}
          navigate={navigate}
          data-testid="bookmarks-component"
        />
      ) : null}
      <section
        id="viewer-thumbnail"
        className={classNames(styles.thumbnails, { [styles.visible]: !toggle })}
        data-testid="viewer-thumbnail"
        aria-label="PDF thumbnails"
      />
    </aside>
  );
};
