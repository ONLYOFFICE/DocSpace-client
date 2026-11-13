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

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyScreenSvgUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.light.svg?url";
import EmptyScreenSvgDarkUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.dark.svg?url";

import type { TFilesSettings } from "@docspace/shared/api/files/types";
import MediaGallery from "@onlyoffice/apps-ui-kit/media-viewer/MediaGallery";
import type { TFile } from "@onlyoffice/apps-ui-kit/media-viewer/MediaViewer.types";
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
import InvalidLinkError from "@/components/InvalidLinkError";
import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { PAGE_COUNT } from "@/utils/constants";

import { getFolderErrorEvent, type MediaViewerErrorEvent } from "./_utils";

const ICON_SIZES: TItemIconSizes[] = [24, 32, 64, 96];

export type MediaViewerClientProps = {
  folderId: string;
  requestToken?: string;
  startFileId?: string;
  filesSettings: TFilesSettings;
};

export default function MediaViewerClient({
  folderId,
  requestToken,
  startFileId,
  filesSettings,
}: MediaViewerClientProps) {
  const { t } = useTranslation(["Common"]);
  const { sdkConfig } = useSDKConfig();
  const { isBase } = useTheme();
  const { getIcon: getItemIcon } = useItemIcon({ filesSettings });

  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType>();
  const [errorEvent, setErrorEvent] = useState<MediaViewerErrorEvent>();

  useEffect(() => {
    frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
  }, []);

  useEffect(() => {
    if (errorEvent) frameCallEvent({ event: errorEvent });
  }, [errorEvent]);

  useEffect(() => {
    const onResize = () => {
      setCurrentDeviceType(getDeviceTypeByWidth(window.innerWidth));
    };

    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getIcon = useCallback(
    (size: number, ext: string) =>
      getItemIcon(ext, ICON_SIZES.find((iconSize) => iconSize === size)),
    [getItemIcon],
  );

  const onDownload = useCallback(
    (file: TFile) =>
      openUrl({
        url: file.viewUrl,
        action: UrlActionType.Download,
        isFrame: true,
        frameConfig: sdkConfig,
      }),
    [sdkConfig],
  );

  const onLoadError = useCallback(
    (error: unknown) => setErrorEvent(getFolderErrorEvent(error)),
    [],
  );

  if (errorEvent) return <InvalidLinkError />;

  return (
    <MediaGallery
      t={t}
      folderId={folderId}
      requestToken={requestToken}
      startFileId={startFileId}
      pageSize={PAGE_COUNT}
      extsImagePreviewed={filesSettings.extsImagePreviewed ?? []}
      getIcon={getIcon}
      currentDeviceType={currentDeviceType}
      emptyContent={
        <EmptyScreenContainer
          imageSrc={isBase ? EmptyScreenSvgUrl : EmptyScreenSvgDarkUrl}
          imageAlt=""
          headerText={t("Common:NoMediaFiles")}
        />
      }
      onDownload={onDownload}
      onLoadError={onLoadError}
    />
  );
}
