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

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFolder } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { libraryUrl } from "../../_utils/libraryUrl";
import LibraryCountryList from "../../_components/forms-grid/LibraryCountryList";

const LibraryPage = () => {
  const router = useRouter();
  const { libraryId, roomId } = useFormsSettingsStore();
  const [folders, setFolders] = useState<TFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!libraryId) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const filter = FilesFilter.getDefault();
    filter.page = 0;
    filter.pageCount = 100;

    api.files
      .getFolder(libraryId, filter, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setFolders(res.folders);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFolders([]);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [libraryId]);

  const handleOpenFolder = useCallback(
    (folder: TFolder) => {
      router.push(
        libraryUrl({
          langId: folder.id,
          roomId: roomId || undefined,
          libraryId: libraryId || undefined,
        }),
      );
    },
    [roomId, libraryId, router],
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 32 }}>
        <RectangleSkeleton width="320px" height="200px" borderRadius="8px" animate />
        <RectangleSkeleton width="240px" height="24px" borderRadius="4px" animate />
      </div>
    );
  }

  if (folders.length === 0) return null;

  return (
    <LibraryCountryList folders={folders} onOpenFolder={handleOpenFolder} />
  );
};

export default LibraryPage;
