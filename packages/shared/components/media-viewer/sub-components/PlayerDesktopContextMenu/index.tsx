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
