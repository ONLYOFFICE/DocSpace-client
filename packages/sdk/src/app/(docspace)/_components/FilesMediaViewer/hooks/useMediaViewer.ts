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

import { useCallback, useMemo } from "react";

import { isVideo } from "@docspace/shared/components/media-viewer/MediaViewer.utils";
import type { PlaylistType } from "@docspace/shared/components/media-viewer/MediaViewer.types";
import { thumbnailStatuses } from "@docspace/shared/constants";
import type { TFilesSettings } from "@docspace/shared/api/files/types";

import { useMediaViewerStore } from "@/app/(docspace)/_store/MediaViewerStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import useItemIcon, {
  type TItemIconSizes,
} from "@/app/(docspace)/_hooks/useItemIcon";

type UseMediaViewerProps = {
  filesSettings: TFilesSettings;
};

const getPlayList = (files: TFileItem[]) => {
  const filesList = [...files];
  const playlist: PlaylistType[] = [];
  let id = 0;
  const itemsWithoutThumb = [];

  if (filesList.length > 0) {
    filesList.forEach((file) => {
      const canOpenPlayer =
        file.viewAccessibility?.ImageView || file.viewAccessibility?.MediaView;

      if (canOpenPlayer) {
        playlist.push({
          id,
          fileId: file.id,
          src: file.viewUrl,
          title: file.title,
          fileExst: file.fileExst,
          fileStatus: file.fileStatus,
          canShare: file.canShare,
          version: file.version,
          thumbnailUrl:
            !file.providerItem && file.thumbnailUrl ? file.thumbnailUrl : "",
        });

        const thumbnailIsNotCreated =
          file.thumbnailStatus === thumbnailStatuses.WAITING;

        const isVideoOrImage =
          file.viewAccessibility?.ImageView || isVideo(file.fileExst);

        if (thumbnailIsNotCreated && isVideoOrImage)
          itemsWithoutThumb.push(file);

        id++;
      }
    });
  }

  return playlist;
};

export function useMediaViewer({ filesSettings }: UseMediaViewerProps) {
  const {
    visible,
    setMediaViewerData,
    mediaId,
    setMediaId,
    autoPlay,
    setAutoPlay,
  } = useMediaViewerStore();
  const { items } = useFilesListStore();
  const { getIcon: getIconFromHook } = useItemIcon({ filesSettings });

  const onClose = useCallback(() => {
    setMediaViewerData({ id: null, visible: false });
  }, [setMediaViewerData]);

  const files = useMemo(() => items.filter((item) => !item.isFolder), [items]);

  const playlist = useMemo(() => getPlayList(files), [files]);

  const playlistPos = playlist.find((file) => file.fileId === mediaId)?.id || 0;

  const onNextClick = useCallback(() => {
    const positionIndex = (playlistPos + 1) % playlist.length;

    if (positionIndex === 0) {
      return;
    }

    const fileId = playlist[positionIndex].fileId;

    setAutoPlay(false);
    setMediaId(fileId);
  }, [playlist, playlistPos, setAutoPlay, setMediaId]);

  const onPrevClick = useCallback(() => {
    const positionIndex = playlistPos - 1;

    if (positionIndex === -1) {
      return;
    }

    const fileId = playlist[positionIndex].fileId;

    setAutoPlay(false);
    setMediaId(fileId);
  }, [playlist, playlistPos, setAutoPlay, setMediaId]);

  const getIcon = useCallback(
    (size: number, ext: string) => {
      return getIconFromHook(ext, size as TItemIconSizes);
    },
    [getIconFromHook],
  );

  return {
    onClose,
    visible,
    mediaId,
    files,
    extsImagePreviewed: filesSettings?.extsImagePreviewed || [],
    playlist,
    playlistPos,
    onNextClick,
    onPrevClick,
    autoPlay,
    getIcon,
  };
}
