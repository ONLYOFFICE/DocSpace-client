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

"use client";

import React, { useCallback, useMemo, useRef } from "react";

import type { TFolder } from "@docspace/shared/api/files/types";
import { FolderTile } from "@docspace/ui-kit/components/tiles/folder-tile";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import type { TGetIcon } from "@/app/(docspace)/_hooks/useItemIcon";
import type { TFormsContextMenuItem } from "../../_hooks/useFormsContextMenu";

import styles from "./FormsTile.module.scss";

type SubFolderTileProps = {
  folder: TFolder;
  getIcon: TGetIcon;
  onOpenFolder: (folder: TFolder) => void;
  contextOptions: TFormsContextMenuItem[];
};

const SubFolderTile = ({
  folder,
  getIcon,
  onOpenFolder,
  contextOptions,
}: SubFolderTileProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const { isBase } = useTheme();

  const folderIcon = getIcon(undefined, 32);

  const openFolder = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpenFolder(folder);
    },
    [folder, onOpenFolder],
  );

  const folderItem = useMemo(
    () => ({
      id: folder.id,
      title: folder.title,
      isFolder: true as const,
      contextOptions: [] as string[],
    }),
    [folder.id, folder.title],
  );

  const element = (
    <RoomIcon logo={folderIcon} title={folder.title} showDefault={false} />
  );

  const tileContent = (
    <div>
      <Link
        className="item-file-name"
        type={LinkType.page}
        title={folder.title}
        fontWeight={600}
        onClick={openFolder}
        color={isBase ? globalColors.black : globalColors.white}
        isTextOverflow
        dir="auto"
        view="tile"
      >
        {folder.title}
      </Link>
    </div>
  );

  return (
    <div className={styles.tile}>
      <div className="files-item">
        <FolderTile
          item={folderItem}
          contextOptions={contextOptions}
          getContextModel={() => contextOptions}
          tileContextClick={() => {}}
          checked={false}
          isActive={false}
          inProgress={false}
          isEdit={false}
          showHotkeyBorder={false}
          onSelect={() => onOpenFolder(folder)}
          element={element}
          temporaryIcon={folderIcon}
          forwardRef={tileRef}
        >
          {tileContent}
        </FolderTile>
      </div>
    </div>
  );
};

export default SubFolderTile;
