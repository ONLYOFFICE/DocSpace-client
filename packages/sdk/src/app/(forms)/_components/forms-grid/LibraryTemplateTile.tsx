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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import { FileTile } from "@docspace/ui-kit/components/tiles/file-tile";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { copyToFolder } from "@docspace/shared/api/files";
import type { TFile } from "@docspace/shared/api/files/types";
import { ConflictResolveType } from "@docspace/shared/enums";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import type { TGetIcon } from "@/app/(docspace)/_hooks/useItemIcon";
import TileContent from "@/app/(docspace)/(files)/_components/tile-view/sub-components/TileContent";
import { FormsSection } from "@/types/forms";
import { sectionToPath } from "../../_utils/sectionFromPathname";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";

import styles from "./FormsTile.module.scss";

type LibraryTemplateTileProps = {
  item: TFileItem;
  file: TFile;
  getIcon: TGetIcon;
};

const LibraryTemplateTile = ({
  item,
  file,
  getIcon,
}: LibraryTemplateTileProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("Common");
  const router = useRouter();
  const { filesSettings } = useFilesSettingsStore();
  const { roomId, libraryId } = useFormsSettingsStore();
  const [isCopying, setIsCopying] = useState(false);

  const thumbUrl = item.thumbnailUrl
    ? item.thumbnailUrl.replace(/^https?:\/\/[^/]+/, "")
    : "";
  const [blobThumbnail, setBlobThumbnail] = useState("");

  useEffect(() => {
    if (!thumbUrl || item.providerItem) return;

    let cancelled = false;
    let blobUrl = "";

    fetch(thumbUrl, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setBlobThumbnail(blobUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobThumbnail("");
    };
  }, [thumbUrl, item.providerItem]);

  const handleUseTemplate = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isCopying || !roomId) return;

      setIsCopying(true);
      try {
        const operations = await copyToFolder(
          Number(roomId),
          [],
          [file.id as number],
          ConflictResolveType.Duplicate,
          false,
        );

        const op = operations?.[0];

        if (op?.error) {
          toastr.error(op.error);
          return;
        }

        // Navigate immediately — no polling needed. MyForms page will
        // fetch fresh data on mount, and the socket will push real-time
        // updates once the server finishes the copy operation.
        const params = new URLSearchParams();
        if (roomId) params.set("roomId", String(roomId));
        if (libraryId) params.set("libraryId", String(libraryId));
        const qs = params.toString();

        router.push(
          `${sectionToPath(FormsSection.MyForms)}${qs ? `?${qs}` : ""}`,
        );
      } catch (error) {
        toastr.error(error as string);
      } finally {
        setIsCopying(false);
      }
    },
    [isCopying, roomId, libraryId, file.id, router],
  );

  const displayFileExtension = Boolean(filesSettings?.displayFileExtension);

  const temporaryExtension =
    item.id === -1 ? `.${item.fileExst}` : item.fileExst;
  const temporaryIcon = getIcon(temporaryExtension, 96, item.contentLength);

  const element = (
    <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
  );

  const tileContent = (
    <TileContent
      item={item}
      displayFileExtension={displayFileExtension}
      onTitleClick={() => {}}
    />
  );

  return (
    <div className={styles.tile}>
      <div className="files-item">
        <FileTile
          item={item}
          contextOptions={[]}
          isHighlight={false}
          checked={false}
          isActive={false}
          inProgress={isCopying}
          isBlockingOperation={false}
          isEdit={false}
          showHotkeyBorder={false}
          onSelect={() => {}}
          getContextModel={() => []}
          tileContextClick={() => {}}
          element={element}
          badges={
            <Button
              label={
                isCopying
                  ? t("Common:CopyingTemplate")
                  : t("Common:UseTemplate")
              }
              size={ButtonSize.extraSmall}
              onClick={handleUseTemplate}
              isDisabled={isCopying}
              isLoading={isCopying}
            />
          }
          thumbnailClick={() => {}}
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

export default LibraryTemplateTile;
