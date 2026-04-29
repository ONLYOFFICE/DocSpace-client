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
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import { useLibraryParams } from "../../../_hooks/useLibraryParams";
import useLibraryLandingData from "../../../_hooks/useLibraryLandingData";
import { libraryUrl } from "../../../_utils/libraryUrl";
import { useFormsSettingsStore } from "../../../_store/FormsSettingsStore";
import { useLibraryBreadcrumb } from "../../../_components/library-breadcrumb/LibraryBreadcrumbContext";
import LibraryLandingPage from "../../../_components/library-landing";
import FormsEmpty from "../../../_components/forms-empty";

const LibraryLandingRoute = () => {
  const router = useRouter();
  const { langId, roomId, libraryId } = useLibraryParams();
  const formsSettingsStore = useFormsSettingsStore();
  const breadcrumb = useLibraryBreadcrumb();
  const [folders, setFolders] = useState<TFolder[]>([]);
  const [countriesCount, setCountriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch language folder contents (categories)
  useEffect(() => {
    if (!langId) return;

    const controller = new AbortController();
    setIsLoading(true);

    const filter = FilesFilter.getDefault();
    filter.page = 0;
    filter.pageCount = 100;

    api.files
      .getFolder(langId, filter, controller.signal)
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
  }, [langId]);

  // Fetch countries count from root library folder
  useEffect(() => {
    const lid = formsSettingsStore.libraryId;
    if (!lid) return;

    const controller = new AbortController();
    const filter = FilesFilter.getDefault();
    filter.page = 0;
    filter.pageCount = 100;

    api.files
      .getFolder(lid, filter, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setCountriesCount(res.folders.length);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [formsSettingsStore.libraryId]);

  const { categories, totalTemplatesCount } = useLibraryLandingData(folders);

  const handleClickItem = useCallback(
    async (item: { type: string; original: TFile | TFolder; id: number | string }, category: TFolder) => {
      if (item.type === "file") {
        router.push(
          libraryUrl({
            langId: langId ?? undefined,
            categoryId: category.id,
            templateId: item.id,
            templateType: "file",
            roomId: roomId || undefined,
            libraryId: libraryId || undefined,
          }),
        );
        return;
      }

      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = 1;

        const res = await api.files.getFolder(item.id, filter);
        const firstFile = res.files[0];
        const firstFolder = res.folders[0];

        if (firstFile) {
          router.push(
            libraryUrl({
              langId: langId ?? undefined,
              categoryId: item.id,
              templateId: firstFile.id,
              templateType: "file",
              roomId: roomId || undefined,
              libraryId: libraryId || undefined,
            }),
          );
          return;
        }

        if (firstFolder) {
          router.push(
            libraryUrl({
              langId: langId ?? undefined,
              categoryId: item.id,
              templateId: firstFolder.id,
              templateType: "folder",
              roomId: roomId || undefined,
              libraryId: libraryId || undefined,
            }),
          );
          return;
        }
      } catch {
        // ignore
      }

      router.push(
        libraryUrl({
          langId: langId ?? undefined,
          categoryId: item.id,
          roomId: roomId || undefined,
          libraryId: libraryId || undefined,
        }),
      );
    },
    [langId, roomId, libraryId, router],
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 800, margin: "0 auto", paddingTop: 24, paddingInline: 24, gap: 48, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", maxWidth: 600 }}>
          <RectangleSkeleton width="100%" height="30px" borderRadius="4px" animate />
          <div style={{ width: "70%" }}>
            <RectangleSkeleton width="100%" height="22px" borderRadius="4px" animate />
          </div>
          <div style={{ marginTop: 20, width: "100%" }}>
            <RectangleSkeleton width="100%" height="48px" borderRadius="8px" animate />
          </div>
        </div>
        <RectangleSkeleton width="100%" height="120px" borderRadius="12px" animate />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, width: "100%" }}>
          {Array.from({ length: 4 }, (_, i) => (
            <RectangleSkeleton key={i} width="100%" height="160px" borderRadius="6px" animate />
          ))}
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return <FormsEmpty />;
  }

  return (
    <LibraryLandingPage
      folders={folders}
      categories={categories}
      totalTemplatesCount={totalTemplatesCount}
      countriesCount={countriesCount}
      language={breadcrumb?.langTitle ?? ""}
      langId={langId}
      roomId={roomId}
      libraryId={libraryId}
      onClickItem={handleClickItem}
    />
  );
};

export default LibraryLandingRoute;
