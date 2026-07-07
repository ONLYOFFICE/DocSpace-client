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

import React from "react";
import { useTranslation } from "react-i18next";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  RoomSearchArea,
  SortByFieldName,
  FilterGroups,
  FilterKeys,
  FilterSubject,
} from "@docspace/shared/enums";
import {
  getSubjectId,
  getSubjectOwnerId,
  getTags,
} from "@docspace/ui-kit/components/filter/Filter.utils";
import { getUser as _getUser } from "@docspace/shared/api/people";

// `getUser` from shared/api is loosely typed (signature is `userName = null`).
// Re-type it locally for ergonomic call sites without leaking `as unknown`.
const getUser = _getUser as unknown as (id: string) => Promise<{
  displayName?: string;
} | null>;
import type {
  TItem,
  TOnFilter,
} from "@docspace/ui-kit/components/filter/Filter.types";
import type { TSortBy } from "@docspace/shared/types";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg";

import {
  useAgentsListStore,
  useAgentsUserStore,
  useAgentTagsStore,
  type AgentsViewAs,
} from "../../_store";

export default function useAgentsFilter() {
  const { t } = useTranslation(["Common"]);
  const store = useAgentsListStore();
  const userStore = useAgentsUserStore();
  const tagsStore = useAgentTagsStore();

  const filter = store.filter;
  const userId = userStore.user?.id;
  const isCollaborator = userStore.user?.isCollaborator ?? false;
  const isVisitor = userStore.user?.isVisitor ?? false;

  const apply = React.useCallback(
    (newFilter: RoomsFilter) => {
      store.fetchAgents(newFilter);
    },
    [store],
  );

  const onClearFilter = React.useCallback(() => {
    const defaultFilter = RoomsFilter.getDefault(
      userId,
      RoomSearchArea.AIAgents,
    );
    apply(defaultFilter);
  }, [apply, userId]);

  const onSearch = React.useCallback(
    (value: string) => {
      const next = filter.clone();
      next.filterValue = value;
      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const getSelectedInputValue = React.useCallback(
    () => filter.filterValue ?? "",
    [filter.filterValue],
  );

  const onSort = React.useCallback(
    (sortId: string, sortDirection: string) => {
      const next = filter.clone();
      next.sortBy = sortId;
      next.sortOrder = sortDirection === "desc" ? "descending" : "ascending";
      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const getSortData = React.useCallback(
    () => [
      {
        id: "sort-by_name",
        key: SortByFieldName.Name,
        label: t("Common:Label", { defaultValue: "Name" }),
        default: true,
      },
      {
        id: "sort-by_modified",
        key: SortByFieldName.ModifiedDate,
        label: t("Common:LastModifiedDate", {
          defaultValue: "Last modified date",
        }),
        default: true,
      },
      {
        id: "sort-by_author",
        key: SortByFieldName.Author,
        label: t("Common:Owner", { defaultValue: "Owner" }),
        default: true,
      },
    ],
    [t],
  );

  const getSelectedSortData = React.useCallback(
    () =>
      ({
        sortId: filter.sortBy as TSortBy,
        sortDirection: filter.sortOrder === "ascending" ? "asc" : "desc",
      }) as { sortId: TSortBy; sortDirection: "asc" | "desc" },
    [filter.sortBy, filter.sortOrder],
  );

  // ── Advanced filter (Contacts / Owners / Tags) ──────────────────────────
  // Mirrors client `Section/Filter/index.js` AI-agents branch.

  const onFilter: TOnFilter = React.useCallback(
    (data) => {
      const subjectId = getSubjectId(data) || null;
      const subjectOwnerId = getSubjectOwnerId(data) || null;
      const tags = getTags(data) || null;

      const next = filter.clone();
      next.page = 0;

      next.subjectFilter = null;
      next.subjectId = null;
      next.subjectOwnerId = null;

      if (subjectId) {
        next.subjectId = String(subjectId);
        if (subjectId === FilterKeys.me && userId) {
          next.subjectId = `${userId}`;
        }
      }

      if (subjectOwnerId) {
        next.subjectOwnerId =
          subjectOwnerId === FilterKeys.me && userId
            ? `${userId}`
            : String(subjectOwnerId);
      }

      if (tags) {
        const tagList = tags as string[];
        if (!tagList?.length) {
          next.tags = null;
          next.withoutTags = true;
        } else {
          next.tags = tagList;
          next.withoutTags = false;
        }
      } else {
        next.tags = null;
        next.withoutTags = false;
      }

      apply(next);
    },
    [filter, apply, userId],
  );

  const getFilterData = React.useCallback(async () => {
    // Lazy-fetch tags once per session via the shared AgentTagsStore.
    let tags = tagsStore.tags;
    if (!tags || tags.length === 0) {
      try {
        await tagsStore.fetchTags();
        tags = tagsStore.tags;
      } catch {
        tags = [];
      }
    }

    const subjectOptions = [
      {
        key: FilterGroups.roomFilterSubject,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:Contacts", { defaultValue: "Contacts" }),
        isHeader: true,
        isLast: !tags?.length,
        withMultiItems: true,
      },
      {
        id: "filter_author-me",
        key: FilterKeys.me,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:MeLabel", { defaultValue: "Me" }),
      },
      {
        id: "filter_author-user",
        key: FilterKeys.user,
        group: FilterGroups.roomFilterSubject,
        displaySelectorType: "link",
      },
    ];

    if (!isCollaborator && !isVisitor) {
      subjectOptions.push({
        id: "filter_author-other",
        key: FilterKeys.other,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:SelectAction", { defaultValue: "Select" }),
      });
    }

    const ownerOptions = [
      {
        key: FilterGroups.roomFilterOwner,
        group: FilterGroups.roomFilterOwner,
        label: t("Common:Owners", { defaultValue: "Owners" }),
        isHeader: true,
        withoutSeparator: true,
        withMultiItems: true,
      },
      {
        id: "filter_owner-me",
        key: FilterKeys.me,
        group: FilterGroups.roomFilterOwner,
        label: t("Common:MeLabel", { defaultValue: "Me" }),
      },
      {
        id: "filter_owner-user",
        key: FilterKeys.user,
        group: FilterGroups.roomFilterOwner,
        displaySelectorType: "link",
      },
    ];

    if (!isCollaborator && !isVisitor) {
      ownerOptions.push({
        id: "filter_owner-other",
        key: FilterKeys.other,
        group: FilterGroups.roomFilterOwner,
        label: t("Common:SelectAction", { defaultValue: "Select" }),
      });
    }

    const filterOptions: unknown[] = [];
    filterOptions.push(...subjectOptions);
    filterOptions.push(...ownerOptions);

    if (tags?.length > 0) {
      const tagsOptions = tags.map((tag) => ({
        key: tag,
        group: FilterGroups.roomFilterTags,
        label: tag,
        isMultiSelect: true,
      }));

      filterOptions.push({
        key: FilterGroups.roomFilterTags,
        group: FilterGroups.roomFilterTags,
        label: t("Common:Tags", { defaultValue: "Tags" }),
        isHeader: true,
        isLast: true,
      });

      filterOptions.push(...tagsOptions);
    }

    return filterOptions as Awaited<ReturnType<() => Promise<TItem[]>>>;
  }, [t, tagsStore, isCollaborator, isVisitor]);

  const getSelectedFilterData = React.useCallback(async (): Promise<
    TItem[]
  > => {
    const filterValues: TItem[] = [];

    if (filter.subjectId) {
      const isMe = userId === filter.subjectId;
      let label = isMe
        ? t("Common:MeLabel", { defaultValue: "Me" })
        : filter.subjectId;
      try {
        if (!isMe) {
          const user = await getUser(filter.subjectId);
          label = user?.displayName ?? filter.subjectId;
        }
      } catch {
        // ignore — fall back to subjectId as label
      }

      const subject: TItem = {
        key: isMe ? FilterKeys.me : filter.subjectId,
        group: FilterGroups.roomFilterSubject,
        label,
      };

      if (filter.subjectFilter?.toString()) {
        if (filter.subjectFilter.toString() === FilterSubject.Owner) {
          subject.selectedLabel = `${t("Common:Owner", { defaultValue: "Owner" })}: ${label}`;
        }

        filterValues.push(subject);
        filterValues.push({
          key: filter.subjectFilter.toString(),
          group: FilterGroups.roomFilterOwner,
          label: "",
        });
      } else {
        filterValues.push(subject);
      }
    }

    if (filter.subjectOwnerId) {
      const isMe = userId === filter.subjectOwnerId;
      let label = isMe
        ? t("Common:MeLabel", { defaultValue: "Me" })
        : filter.subjectOwnerId;
      try {
        if (!isMe) {
          const owner = await getUser(filter.subjectOwnerId);
          label = owner?.displayName ?? filter.subjectOwnerId;
        }
      } catch {
        // ignore
      }

      filterValues.push({
        key: isMe ? FilterKeys.me : filter.subjectOwnerId,
        group: FilterGroups.roomFilterOwner,
        label,
        selectedLabel: `${t("Common:Owner", { defaultValue: "Owner" })}: ${label}`,
      });
    }

    if (filter.tags && filter.tags.length > 0) {
      filterValues.push({
        key: filter.tags as unknown as string,
        group: FilterGroups.roomFilterTags,
        isMultiSelect: true,
      } as TItem);
    }

    return filterValues;
  }, [filter.subjectId, filter.subjectFilter, filter.subjectOwnerId, filter.tags, t, userId]);

  // initSelectedFilterData runs once on mount (the FilterComponent reads it
  // synchronously). We compute the synchronous subset here — async user
  // lookups are handled by getSelectedFilterData when the dropdown opens.
  const initSelectedFilterData = React.useMemo<TItem[]>(() => {
    const filterValues: TItem[] = [];

    if (filter.subjectId) {
      const isMe = userId === filter.subjectId;
      filterValues.push({
        key: isMe ? FilterKeys.me : filter.subjectId,
        group: FilterGroups.roomFilterSubject,
        label: isMe
          ? t("Common:MeLabel", { defaultValue: "Me" })
          : filter.subjectId,
      });
    }

    if (filter.subjectOwnerId) {
      const isMe = userId === filter.subjectOwnerId;
      filterValues.push({
        key: isMe ? FilterKeys.me : filter.subjectOwnerId,
        group: FilterGroups.roomFilterOwner,
        label: isMe
          ? t("Common:MeLabel", { defaultValue: "Me" })
          : filter.subjectOwnerId,
      });
    }

    if (filter.tags && filter.tags.length > 0) {
      filterValues.push({
        key: filter.tags as unknown as string,
        group: FilterGroups.roomFilterTags,
        isMultiSelect: true,
      } as TItem);
    }

    return filterValues;
    // initSelectedFilterData should snapshot mount-time state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getViewSettingsData = React.useCallback(
    () => [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("Common:ViewList", { defaultValue: "List view" }),
        icon: <ViewRowsReactSvg />,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("Common:ViewTiles", { defaultValue: "Tile view" }),
        icon: <ViewTilesReactSvg />,
      },
    ],
    [t],
  );

  const onChangeViewAs = React.useCallback(() => {
    const isDesktopWidth =
      typeof window !== "undefined" && window.innerWidth > 1024;
    const next: AgentsViewAs =
      store.viewAs === "tile" ? (isDesktopWidth ? "table" : "row") : "tile";
    store.setViewAs(next);
  }, [store]);

  const removeSelectedItem = React.useCallback(
    ({
      key,
      group,
    }: {
      key: string | number;
      group?: FilterGroups;
    }) => {
      const next = filter.clone();

      if (group === FilterGroups.roomFilterSubject) {
        next.subjectId = null;
        next.excludeSubject = null;
        next.subjectFilter = null;
      }

      if (group === FilterGroups.roomFilterOwner) {
        next.subjectOwnerId = null;
      }

      if (group === FilterGroups.roomFilterTags) {
        const newTags = next.tags ? [...next.tags] : [];
        const idx = newTags.findIndex((tag) => tag === key);
        if (idx > -1) newTags.splice(idx, 1);

        next.tags = newTags.length > 0 ? newTags : null;
        next.withoutTags = false;
      }

      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const clearAll = React.useCallback(() => {
    onClearFilter();
  }, [onClearFilter]);

  return {
    onClearFilter,
    onSearch,
    getSelectedInputValue,
    onSort,
    getSortData,
    getSelectedSortData,
    onFilter,
    getFilterData,
    getSelectedFilterData,
    getViewSettingsData,
    onChangeViewAs,
    removeSelectedItem,
    clearAll,
    initSelectedFilterData,
  };
}
