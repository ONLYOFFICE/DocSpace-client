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

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyScreenSvgUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.light.svg?url";
import EmptyScreenSvgDarkUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.dark.svg?url";

import { getFolder } from "@docspace/shared/api/files";
import type {
  TFile,
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";
import type { NumberOrString } from "@docspace/shared/components/media-viewer/MediaViewer.types";
import { ViewerLoader } from "@onlyoffice/apps-ui-kit/media-viewer/sub-components/ViewerLoader";
import { DeviceType, UrlActionType } from "@docspace/shared/enums";
import { getDeviceTypeByWidth } from "@docspace/shared/utils";
import {
  frameCallEvent,
  getFrameId,
  openUrl,
} from "@docspace/shared/utils/common";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";

import useItemIcon, {
  type TItemIconSizes,
} from "@/app/(docspace)/_hooks/useItemIcon";
import getPlayList from "@/app/(docspace)/_utils/get-play-list";
import { useSDKConfig } from "@/providers/SDKConfigProvider";

import { getMediaViewerFilter } from "./_utils";

const PRELOAD_OFFSET = 3;
const ICON_SIZES: TItemIconSizes[] = [24, 32, 64, 96];

export type MediaViewerClientProps = {
  folderId: string;
  startFileId?: string;
  folderList: TGetFolder;
  filesSettings: TFilesSettings;
};

export default function MediaViewerClient({
  folderId,
  startFileId,
  folderList,
  filesSettings,
}: MediaViewerClientProps) {
  const { t } = useTranslation(["Common"]);
  const { sdkConfig } = useSDKConfig();
  const { isBase } = useTheme();
  const { getIcon: getItemIcon } = useItemIcon({ filesSettings });

  const [files, setFiles] = useState(folderList.files);
  const [canLoadMore, setCanLoadMore] = useState(
    folderList.files.length < folderList.total,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mediaId, setMediaId] = useState<NumberOrString | undefined>(
    startFileId,
  );
  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType>();

  const playlist = useMemo(() => getPlayList(files), [files]);

  const currentItem =
    playlist.find((item) => String(item.fileId) === String(mediaId)) ??
    playlist[0];
  const playlistPos = currentItem?.id ?? 0;

  useEffect(() => {
    frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
  }, []);

  useEffect(() => {
    const onResize = () => {
      setCurrentDeviceType(getDeviceTypeByWidth(window.innerWidth));
    };

    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!canLoadMore || isLoadingMore) return;
    if (playlistPos < playlist.length - PRELOAD_OFFSET) return;

    setIsLoadingMore(true);

    getFolder(folderId, getMediaViewerFilter(folderId, files.length))
      .then((res) => {
        setFiles((prev) => [...prev, ...res.files]);
        setCanLoadMore(
          res.files.length > 0 && files.length + res.files.length < res.total,
        );
      })
      .catch(() => setCanLoadMore(false))
      .finally(() => setIsLoadingMore(false));
  }, [
    canLoadMore,
    isLoadingMore,
    playlistPos,
    playlist.length,
    folderId,
    files.length,
  ]);

  const onNextClick = useCallback(() => {
    const nextItem = playlist[playlistPos + 1];

    if (nextItem) setMediaId(nextItem.fileId);
  }, [playlist, playlistPos]);

  const onPrevClick = useCallback(() => {
    const prevItem = playlist[playlistPos - 1];

    if (prevItem) setMediaId(prevItem.fileId);
  }, [playlist, playlistPos]);

  const getIcon = useCallback(
    (size: number, ext: string) =>
      getItemIcon(ext, ICON_SIZES.find((iconSize) => iconSize === size)),
    [getItemIcon],
  );

  const onClickDownload = useCallback(
    (file: TFile) =>
      openUrl({
        url: file.viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      }),
    [sdkConfig],
  );

  const onDownload = useCallback(
    (id: NumberOrString) => {
      const file = files.find((item) => item.id === id);

      if (file) onClickDownload(file);
    },
    [files, onClickDownload],
  );

  if (!currentDeviceType) return <ViewerLoader isLoading />;

  if (!currentItem) {
    if (canLoadMore) return <ViewerLoader isLoading />;

    return (
      <EmptyScreenContainer
        imageSrc={isBase ? EmptyScreenSvgUrl : EmptyScreenSvgDarkUrl}
        imageAlt=""
        headerText={t("Common:NoMediaFiles")}
      />
    );
  }

  return (
    <MediaViewer
      t={t}
      visible
      isPublicFile
      files={files}
      playlist={playlist}
      playlistPos={playlistPos}
      currentFileId={currentItem.fileId}
      extsImagePreviewed={filesSettings.extsImagePreviewed ?? []}
      getIcon={getIcon}
      currentDeviceType={currentDeviceType}
      nextMedia={onNextClick}
      prevMedia={onPrevClick}
      onDownload={onDownload}
      onClickDownload={onClickDownload}
    />
  );
}
