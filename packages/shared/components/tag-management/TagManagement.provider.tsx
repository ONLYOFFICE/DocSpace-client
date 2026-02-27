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
  canCreate,
  canEdit,
  canRemove,
  canSearch,
  canBindTag,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const [tags, setTags] = useState<TTag[]>(() => {
    return unionTagsData(roomTags, fetchedTags);
  });

  const [filteredTags, showCreateTag] = useMemo(() => {
    const search = deferredSearchValue.trim();

    if (!search) return [tags, false];

    const filtered = searchFilter(tags, search);

    const showCreateTag = filtered.every((tag) => tag.label.trim() !== search);

    return [filtered, showCreateTag];
  }, [tags, deferredSearchValue]);

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
      canCreate,
      canEdit,
      canRemove,
      canSearch,
      canBindTag,
    }),
    [
      fetchedTags,
      searchValue,
      deferredSearchValue,
      filteredTags,
      showCreateTag,
      clearSearch,
      canCreate,
      canEdit,
      canRemove,
      canSearch,
      canBindTag,
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
