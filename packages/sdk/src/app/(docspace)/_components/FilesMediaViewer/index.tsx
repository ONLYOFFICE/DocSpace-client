/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

"use client";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import { Portal } from "@docspace/shared/components/portal";
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
