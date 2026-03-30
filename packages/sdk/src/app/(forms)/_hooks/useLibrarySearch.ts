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

import { useCallback, useEffect, useRef, useState } from "react";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";

export type SearchResult = {
  id: number | string;
  title: string;
  type: "file" | "folder";
  folderId: number;
};

export default function useLibrarySearch(langId: number | null) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Abort in-flight request on unmount
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
        setHasMore(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      const filter = FilesFilter.getDefault();
      filter.search = term.trim();
      filter.page = 0;
      filter.pageCount = 10;

      api.files
        .getFolder(langId, filter, controller.signal)
        .then((res) => {
          if (controller.signal.aborted) return;

          const mapped: SearchResult[] = res.files.map((f) => ({
            id: f.id,
            title: f.title.replace(/\.pdf$/i, "").replaceAll("_", " "),
            type: "file" as const,
            folderId: f.folderId,
          }));

          setResults(mapped);
          setHasMore(res.total > 10);
          setIsLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults([]);
          setHasMore(false);
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
    setHasMore(false);
  }, []);

  return { results, isLoading, hasMore, query, search, clear };
}
