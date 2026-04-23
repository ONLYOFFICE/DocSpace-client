// (c) Copyright Ascensio System SIA 2009-2026
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
import useFormThumbnail from "../../_hooks/useFormThumbnail";
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

  const thumbUrl = stripHost(item.thumbnailUrl);
  const blobThumbnail = useFormThumbnail(thumbUrl, !item.providerItem);

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
          thumbnail={blobThumbnail}
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
