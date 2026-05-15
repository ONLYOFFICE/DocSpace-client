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

import { useCallback, useEffect, useRef, useState } from "react";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";

export type SearchResult = {
  id: number | string;
  title: string;
  type: "file" | "folder";
  folderId: number;
};

const MAX_RESULTS = 10;

export default function useLibrarySearch(langId: number | null) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const search = useCallback(
    (term: string) => {
      setQuery(term);

      if (!term.trim() || !langId) {
        abortRef.current?.abort();
        setResults([]);
        setIsLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      const filter = FilesFilter.getDefault();
      filter.search = term.trim();
      filter.page = 0;
      filter.pageCount = MAX_RESULTS;
      filter.withSubfolders = true;

      api.files
        .getFolder(langId, filter, controller.signal)
        .then((res) => {
          if (controller.signal.aborted) return;

          const mapped: SearchResult[] = [
            ...res.folders.map((f) => ({
              id: f.id,
              title: f.title,
              type: "folder" as const,
              folderId: f.parentId ?? (langId as number),
            })),
            ...res.files.map((f) => ({
              id: f.id,
              title: f.title.replace(/\.pdf$/i, ""),
              type: "file" as const,
              folderId: f.folderId,
            })),
          ];

          setResults(mapped.slice(0, MAX_RESULTS));
          setIsLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults([]);
          setIsLoading(false);
        });
    },
    [langId],
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setQuery("");
    setIsLoading(false);
  }, []);

  return { results, isLoading, query, search, clear };
}
