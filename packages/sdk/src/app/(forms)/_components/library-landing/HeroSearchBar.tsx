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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { SearchInput } from "@docspace/ui-kit/components/search-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import useLibrarySearch, {
  type SearchResult,
} from "../../_hooks/useLibrarySearch";
import { libraryUrl } from "../../_utils/libraryUrl";
import styles from "./LibraryLanding.module.scss";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);
  // split with capturing group produces alternating: non-match, match, non-match, match...
  // odd indices are always the captured (matched) group
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.searchResultHighlight}>
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

type HeroSearchBarProps = {
  langId: number | null;
  roomId?: string;
  libraryId?: string;
};

const HeroSearchBar = ({ langId, roomId, libraryId }: HeroSearchBarProps) => {
  const { t } = useTranslation("Common");
  const router = useRouter();
  const { results, isLoading, query, search, clear } =
    useLibrarySearch(langId);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search triggered by SearchInput
  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);
      search(value);
    },
    [search],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    clear();
    setIsOpen(false);
  }, [clear]);

  // Open dropdown when we have results or are loading
  useEffect(() => {
    if (inputValue.trim() && (results.length > 0 || isLoading)) {
      setIsOpen(true);
    } else if (!inputValue.trim()) {
      setIsOpen(false);
    }
  }, [inputValue, results.length, isLoading]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = useCallback(
    async (result: SearchResult) => {
      setIsOpen(false);
      setInputValue("");
      clear();

      if (result.type === "file") {
        router.push(
          libraryUrl({
            langId: langId ?? undefined,
            categoryId: result.folderId,
            templateId: result.id,
            templateType: "file",
            roomId: roomId || undefined,
            libraryId: libraryId || undefined,
          }),
        );
        return;
      }

      const folderId = result.folderId || result.id;
      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = 1;

        const res = await api.files.getFolder(folderId, filter);
        const firstFile = res.files[0];
        const firstFolder = res.folders[0];

        if (firstFile) {
          router.push(
            libraryUrl({
              langId: langId ?? undefined,
              categoryId: folderId,
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
              categoryId: folderId,
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
          categoryId: folderId,
          roomId: roomId || undefined,
          libraryId: libraryId || undefined,
        }),
      );
    },
    [langId, roomId, libraryId, router, clear],
  );

  return (
    <div className={styles.heroSearchWrapper} ref={wrapperRef}>
      <SearchInput
        size={InputSize.large}
        scale
        placeholder={t("Common:Search")}
        value={inputValue}
        onChange={handleChange}
        onClearSearch={handleClear}
        refreshTimeout={400}
      />

      {isOpen && (
        <div className={styles.searchDropdown}>
          {isLoading ? (
            <div className={styles.searchLoading}>
              <Loader type={LoaderTypes.dualRing} size="32px" />
            </div>
          ) : results.length === 0 ? (
            <div className={styles.searchNoResults}>
              {t("Common:NotFoundTitle")}
            </div>
          ) : (
            <>
              {results.map((result) => (
                <div
                  key={`${result.type}_${result.id}`}
                  className={styles.searchResultItem}
                  onClick={() => handleSelectResult(result)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelectResult(result);
                  }}
                >
                  {highlightMatch(result.title, query)}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroSearchBar;
