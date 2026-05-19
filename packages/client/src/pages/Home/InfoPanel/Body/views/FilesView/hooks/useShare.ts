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

import axios from "axios";
import React from "react";

import {
  getExternalFolderLinks,
  getExternalLinks,
  getFileSharedUsers,
  getFolderSharedUsers,
} from "@docspace/shared/api/files";
import { TFileLink } from "@docspace/shared/api/files/types";

import { RoomMember } from "@docspace/shared/api/rooms/types";
import { SHARED_MEMBERS_COUNT } from "@docspace/shared/constants";

interface UseShareProps {
  id: string;
  isFolder?: boolean;
  generatePrimaryLink: () => Promise<unknown> | undefined;
}

export const useShare = ({
  id,
  isFolder,
  generatePrimaryLink,
}: UseShareProps) => {
  const [filesLink, setFilesLink] = React.useState<TFileLink[]>([]);
  const [shareMembers, setShareMembers] = React.useState<RoomMember[]>([]);
  const [shareMembersTotal, setShareMembersTotal] = React.useState(0);

  const abortController = React.useRef<AbortController | null>(null);

  const fetchExternalLinks = React.useCallback(async () => {
    try {
      abortController.current?.abort();
      abortController.current = new AbortController();

      await generatePrimaryLink();

      const getExternalLinksMethod = isFolder
        ? getExternalFolderLinks
        : getExternalLinks;

      const getShareUsers = isFolder
        ? getFolderSharedUsers
        : getFileSharedUsers;

      const response = getExternalLinksMethod(
        id,
        0,
        50,
        abortController.current.signal,
      );

      const sharedToUsersResponse = getShareUsers(
        id,
        0,
        SHARED_MEMBERS_COUNT,
        abortController.current.signal,
      );

      const [link, shareUsers] = await Promise.all([
        response,
        sharedToUsersResponse,
      ]);

      setFilesLink(link.items);
      setShareMembers(shareUsers.items);
      setShareMembersTotal(shareUsers.total);
    } catch (error) {
      if (!axios.isCancel(error))
        console.error("Error fetching external links:", error);

      throw error;
    }
  }, [id, isFolder, generatePrimaryLink]);

  return {
    filesLink,
    shareMembers,
    fetchExternalLinks,
    abortController,
    shareMembersTotal,
  };
};
