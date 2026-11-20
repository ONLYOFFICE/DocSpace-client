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

import { headers } from "next/headers";

import { ValidationStatus } from "@docspace/shared/enums";

import { getFilesSettings, getFolderInfo, getFolderPath } from "@/api/files";
import { validatePublicRoomKey } from "@/api/rooms";
import PrivateTargetNotAvailable from "@/components/PrivateTargetNotAvailable";
import {
  MEDIA_VIEWER_LINK_ERROR_HEADER,
  OAUTH_FRAME_HEADER,
} from "@/utils/constants";
import { getPrivateRoomAddress } from "@/utils/private-room-address";
import { logger } from "../../../logger.mjs";

import MediaViewerClient from "./page.client";
import MediaViewerOAuthPage from "./page.oauth.client";
import MediaViewerError from "./page.error.client";
import {
  getFolderErrorEvent,
  isMediaViewerErrorEvent,
  isPortalFolderId,
  isUnauthorizedError,
} from "./_utils";

const isLinkToPrivateRoom = async (key: string) => {
  const { response: link } = await validatePublicRoomKey(key);

  if (link.status !== ValidationStatus.Ok) {
    throw new Error("The link is not valid");
  }

  if (!link.isRoom) return false;

  const room = await getFolderInfo(link.id);

  return room.private;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  logger.info("Media viewer page");

  const { folder: folderId, key, fileId } = await searchParams;

  if (!folderId) return <MediaViewerError event="onNotFound" />;

  const hdrs = await headers();

  const linkError = hdrs.get(MEDIA_VIEWER_LINK_ERROR_HEADER);

  if (isMediaViewerErrorEvent(linkError)) {
    return <MediaViewerError event={linkError} />;
  }

  if (hdrs.get(OAUTH_FRAME_HEADER)) {
    return (
      <MediaViewerOAuthPage
        folderId={folderId}
        requestToken={key}
        startFileId={fileId}
      />
    );
  }

  // Spec: private-rooms/sdk-surface, "Private rooms only through the private pages"
  if (isPortalFolderId(folderId)) {
    let isPrivate: boolean;

    try {
      isPrivate = !!(await getPrivateRoomAddress(
        { id: folderId },
        {},
        getFolderPath,
      ));
    } catch (error) {
      if (!key || !isUnauthorizedError(error)) {
        return <MediaViewerError event={getFolderErrorEvent(error)} />;
      }

      const linkToPrivateRoom = await isLinkToPrivateRoom(key).catch(
        () => null,
      );

      if (linkToPrivateRoom === null) {
        return <MediaViewerError event="onNoAccess" />;
      }

      isPrivate = linkToPrivateRoom;
    }

    if (isPrivate) return <PrivateTargetNotAvailable />;
  }

  const filesSettings = await getFilesSettings().catch(() => undefined);

  if (!filesSettings) return <MediaViewerError event="onNoAccess" />;

  return (
    <MediaViewerClient
      folderId={folderId}
      requestToken={key}
      startFileId={fileId}
      filesSettings={filesSettings}
    />
  );
}
