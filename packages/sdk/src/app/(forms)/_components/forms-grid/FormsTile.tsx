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

import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";

import { FileTile } from "@docspace/ui-kit/components/tiles/file-tile";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";

import type { TFile } from "@docspace/shared/api/files/types";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import type { TGetIcon } from "@/app/(docspace)/_hooks/useItemIcon";

import TileContent from "@/app/(docspace)/(files)/_components/tile-view/sub-components/TileContent";

import { FormsSection } from "@/types/forms";

import useFormsActions from "../../_hooks/useFormsActions";
import useFormsContextMenu from "../../_hooks/useFormsContextMenu";
import { sectionFromPathname } from "../../_utils/sectionFromPathname";
import { stripHost } from "../../_utils/thumbnailUrl";
import FormStatusBadge from "./FormStatusBadge";
import styles from "./FormsTile.module.scss";

type FormsTileProps = {
  item: TFileItem;
  originalFile: TFile;
  getIcon: TGetIcon;
};

const FormsTile = ({ item, originalFile, getIcon }: FormsTileProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("Common");
  const { filesSettings } = useFilesSettingsStore();
  const { openForm } = useFormsActions({ t });
  const { getContextMenuModel } = useFormsContextMenu();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);

  const thumbUrl =
    !item.providerItem && item.thumbnailUrl
      ? stripHost(item.thumbnailUrl)
      : "";

  const displayFileExtension = Boolean(filesSettings?.displayFileExtension);

  const temporaryExtension =
    item.id === -1 ? `.${item.fileExst}` : item.fileExst;
  const temporaryIcon = getIcon(temporaryExtension, 96, item.contentLength);

  const getDefaultAction = React.useCallback(
    (file: TFile) => {
      if (file.isFillingPreparing) return "view" as const;

      switch (activeSection) {
        case FormsSection.MyForms: {
          const canFill =
            file.security?.FillForms &&
            file.viewAccessibility?.WebRestrictedEditing;
          const canEdit =
            file.security?.Edit && file.viewAccessibility?.WebEdit;

          if (canFill) return "fill" as const;
          if (canEdit) return "edit" as const;
          return "view" as const;
        }
        case FormsSection.InProgress: {
          const canFill =
            file.security?.FillForms &&
            file.viewAccessibility?.WebRestrictedEditing;
          if (canFill) return "fill" as const;
          return "view" as const;
        }
        case FormsSection.CompletedForms:
        default:
          return "view" as const;
      }
    },
    [activeSection],
  );

  const openItem = (e: React.MouseEvent) => {
    const { target } = e;
    if (target instanceof HTMLElement && target.tagName === "INPUT") return;
    e.preventDefault();

    if (originalFile) {
      openForm(originalFile, getDefaultAction(originalFile));
    }
  };

  const contextModel = originalFile ? getContextMenuModel(originalFile) : [];

  const element = (
    <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
  );

  const tileContent = (
    <TileContent
      item={item}
      displayFileExtension={displayFileExtension}
      onTitleClick={openItem}
    />
  );

  return (
    <div className={styles.tile}>
      <div className="files-item">
        <FileTile
          item={item}
          contextOptions={contextModel}
          isHighlight={false}
          checked={false}
          isActive={false}
          inProgress={false}
          isBlockingOperation={false}
          isEdit={false}
          showHotkeyBorder={false}
          onSelect={() => {}}
          getContextModel={() => contextModel}
          tileContextClick={() => {}}
          element={element}
          badges={
            originalFile ? (
              <FormStatusBadge file={originalFile} />
            ) : undefined
          }
          thumbnailClick={openItem}
          temporaryIcon={temporaryIcon}
          thumbnail={thumbUrl}
          contentElement={undefined}
          forwardRef={tileRef}
        >
          {tileContent}
        </FileTile>
      </div>
    </div>
  );
};

export default observer(FormsTile);
