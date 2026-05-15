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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import { Portal } from "@docspace/ui-kit/components/portal";
import { TFilesSettings } from "@docspace/shared/api/files/types";

import { useMediaViewer } from "@/app/(docspace)/_components/FilesMediaViewer/hooks/useMediaViewer";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

type FilesMediaViewerProps = {
  filesSettings: TFilesSettings;
};

function FilesMediaViewer({ filesSettings }: FilesMediaViewerProps) {
  const { t } = useTranslation(["Common"]);
  const {
    visible,
    mediaId,
    files,
    onClose,
    extsImagePreviewed,
    playlist,
    playlistPos,
    onNextClick,
    onPrevClick,
    autoPlay,
    getIcon,
  } = useMediaViewer({ filesSettings });
  const { currentDeviceType } = useSettingsStore();

  return visible && mediaId ? (
    <Portal
      visible
      element={
        <MediaViewer
          autoPlay={autoPlay}
          t={t}
          files={files}
          visible={visible}
          playlist={playlist}
          playlistPos={playlistPos}
          extsImagePreviewed={extsImagePreviewed}
          currentFileId={mediaId}
          getIcon={getIcon}
          onClose={onClose}
          currentDeviceType={currentDeviceType}
          nextMedia={onNextClick}
          prevMedia={onPrevClick}
        />
      }
    />
  ) : null;
}

export default observer(FilesMediaViewer);
