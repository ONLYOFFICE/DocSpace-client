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

import React, {
  createContext,
  useMemo,
  useState,
  useDeferredValue,
  useCallback,
} from "react";

import type {
  TTag,
  TagManagementContextValue,
  TagManagementProviderProps,
  ITagManagementStateContext,
} from "./TagManagement.types";
import { searchFilter, unionTagsData } from "./TagManagement.utils";

const TagManagementStateContext =
  createContext<ITagManagementStateContext | null>(null);

export const TagManagementProvider: React.FC<TagManagementProviderProps> = ({
  children,
  roomTags,
  fetchedTags,
  access,
}) => {
  const canCreate = access.canCreate || false;

  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const [tags, setTags] = useState<TTag[]>(() => {
    return unionTagsData(roomTags, fetchedTags);
  });

  const [filteredTags, showCreateTag] = useMemo(() => {
    const search = deferredSearchValue.trim();

    if (!search) return [tags, false];

    const filtered = searchFilter(tags, search);

    const showCreateTag = Boolean(
      canCreate && filtered.every((tag) => tag.label.trim() !== search),
    );

    return [filtered, showCreateTag];
  }, [tags, deferredSearchValue, canCreate]);

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  const value = useMemo<ITagManagementStateContext>(
    () => ({
      tags,
      setTags,
      searchValue,
      deferredSearchValue,
      filteredTags,
      showCreateTag,
      setSearchValue,
      clearSearch,
      access,
    }),
    [
      searchValue,
      deferredSearchValue,
      filteredTags,
      showCreateTag,
      clearSearch,
      access,
      tags,
    ],
  );

  return (
    <TagManagementStateContext.Provider value={value}>
      {children}
    </TagManagementStateContext.Provider>
  );
};

export const useTagManagement = (): TagManagementContextValue => {
  const context = React.use(TagManagementStateContext);
  if (!context) {
    throw new Error(
      "useTagManagement must be used within TagManagementProvider",
    );
  }
  return context;
};
