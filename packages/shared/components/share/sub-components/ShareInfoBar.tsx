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

import { useMemo } from "react";
import classNames from "classnames";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import FolderIcon from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import { useLocalStorage } from "../../../hooks/useLocalStorage";

import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";

import type { TShareBarProps } from "../Share.types";
import styles from "../Share.module.scss";

const ShareInfoBar = ({
  t,
  selfId,
  parentShared,
  isFolder,
  isEditor,
}: TShareBarProps) => {
  const [visibleBar, setVisibleBar] = useLocalStorage(
    `document-bar-${selfId}`,
    true,
  );

  const barData = useMemo(() => {
    if (parentShared) {
      return {
        headerText: isFolder
          ? t("Common:FolderAvailableViaParentFolderLinkTitle")
          : t("Common:FileAvailableViaParentFolderLinkTitle"),
        bodyText: isFolder
          ? t("Common:FolderAvailableViaParentFolderLinkDescription")
          : t("Common:FileAvailableViaParentFolderLinkDescription"),
        iconName: FolderIcon,
      };
    }

    return {
      headerText: isFolder
        ? t("Common:ShareFolder")
        : t("Common:ShareDocument"),
      bodyText: isFolder
        ? t("Common:ShareFolderDescription")
        : t("Common:ShareDocumentDescription"),
      iconName: InfoIcon,
      onClose: () => setVisibleBar(false),
    };
  }, [parentShared, isFolder, t, setVisibleBar]);

  const barIsVisible = visibleBar || parentShared;

  if (!barIsVisible) return null;

  return (
    <div
      className={classNames(styles.containerShareInfoBar, {
        [styles.shareInfoBarEditor]: isEditor,
      })}
    >
      <PublicRoomBar
        {...barData}
        dataTestId="info_panel_share_public_room_bar"
        className={styles.shareInfoBar}
      />
    </div>
  );
};

export default ShareInfoBar;
