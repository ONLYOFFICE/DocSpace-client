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

import React, { useState } from "react";
import ViewRowsIcon from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesIcon from "PUBLIC_DIR/images/view-tiles.react.svg";
import ArticleShowMenuReactSvgUrl from "PUBLIC_DIR/images/article-show-menu.react.svg";
import classNames from "classnames";
import { Bookmarks } from "../Bookmarks";
import styles from "../../PDFViewer.module.scss";
import SidebarProps from "./Sidebar.props";

import { useInterfaceDirection } from "../../../../../../hooks/useInterfaceDirection";

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
