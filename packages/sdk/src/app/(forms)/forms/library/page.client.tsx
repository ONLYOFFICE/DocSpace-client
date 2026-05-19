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

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFolder } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsTourStore } from "../../_store/FormsTourStore";
import { libraryUrl } from "../../_utils/libraryUrl";
import LibraryCountryList from "../../_components/forms-grid/LibraryCountryList";
import FormsEmpty from "../../_components/forms-empty";
import { createMockLibraryFolders } from "../../_utils/mockFormFiles";

const LibraryPage = () => {
  const router = useRouter();
  const { libraryId, roomId } = useFormsSettingsStore();
  const tourStore = useFormsTourStore();
  const [folders, setFolders] = useState<TFolder[]>(() =>
    tourStore.showMockItems ? createMockLibraryFolders() : [],
  );
  const [isLoading, setIsLoading] = useState(!tourStore.showMockItems);

  useEffect(() => {
    if (tourStore.showMockItems) return;

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
  }, [libraryId, tourStore.showMockItems]);

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 32, width: "100%" }}>
        <div style={{ width: "100%", maxWidth: 320 }}>
          <RectangleSkeleton width="100%" height="200px" borderRadius="8px" animate />
        </div>
        <div style={{ marginTop: 32 }}>
          <RectangleSkeleton width="min(280px, 70vw)" height="30px" borderRadius="4px" animate />
        </div>
        <div style={{ marginTop: 12 }}>
          <RectangleSkeleton width="min(340px, 80vw)" height="22px" borderRadius="4px" animate />
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px 16px",
          width: "100%",
          maxWidth: 960,
          marginTop: 40,
        }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
              <RectangleSkeleton width="32px" height="24px" borderRadius="3px" animate />
              <RectangleSkeleton width="80px" height="22px" borderRadius="4px" animate />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (folders.length === 0) return <FormsEmpty />;

  return (
    <LibraryCountryList folders={folders} onOpenFolder={handleOpenFolder} />
  );
};

export default observer(LibraryPage);
