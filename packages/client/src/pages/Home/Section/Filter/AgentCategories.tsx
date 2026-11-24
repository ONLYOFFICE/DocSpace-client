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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getRooms } from "@docspace/shared/api/rooms";
import type RoomsFilter from "@docspace/shared/api/rooms/filter";

import AiCategoryTabs from "SRC_DIR/components/AiCategoryTabs";
import {
  getAgentCategories,
  getAgentCategory,
  getAgentCategoryUrl,
  getVisibleAgentsFilter,
  isAgentListNarrowed,
} from "SRC_DIR/helpers/aiWorkspace";

import styles from "./AgentCategories.module.scss";

type TAgentItem = { roomType?: unknown; tags?: readonly string[] | null };

/**
 * The categories last seen per user. The row is drawn again with each read
 * of the list; it starts from them, so it does not blink while the agents
 * behind a narrowed list are read again.
 */
const lastCategories = new Map<string, string[]>();

type AgentCategoriesProps = {
  roomsFilter?: RoomsFilter;
  folders?: readonly TAgentItem[];
  userId?: string;
};

/**
 * The category row under the filter of the Agents list (My agents): "All",
 * then one tab per tag carried by the agents the user can see. A tab narrows
 * the list to the agents with that tag through the rooms filter, so the
 * choice combines with the search and stays in the address. While the list
 * holds every agent its tags are read from it; once it is narrowed the
 * agents are read again without the filter. No row is shown while no agent
 * carries a tag.
 */
export const AgentCategories = ({
  roomsFilter,
  folders,
  userId,
}: AgentCategoriesProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const cacheKey = userId ?? "";

  const isNarrowed = !!roomsFilter && isAgentListNarrowed(roomsFilter);

  const listed = React.useMemo(
    () => (isNarrowed ? null : getAgentCategories(folders ?? [])),
    [isNarrowed, folders],
  );

  const [read, setRead] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    if (listed) lastCategories.set(cacheKey, listed);
  }, [listed, cacheKey]);

  React.useEffect(() => {
    if (!isNarrowed) return undefined;
    const controller = new AbortController();
    getRooms(getVisibleAgentsFilter(), controller.signal)
      .then((res) => {
        const categories = getAgentCategories(res.folders ?? []);
        lastCategories.set(cacheKey, categories);
        setRead(categories);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [isNarrowed, cacheKey]);

  if (!roomsFilter) return null;

  const selected = getAgentCategory(roomsFilter);
  const known = listed ?? read ?? lastCategories.get(cacheKey) ?? [];
  // A chosen tag no listed agent carries stays, so it can be left.
  const categories =
    selected && !known.includes(selected) ? [...known, selected] : known;

  if (!categories.length) return null;

  const onSelect = (category: string | null) => {
    if (category === selected) return;
    navigate(getAgentCategoryUrl(roomsFilter, category, userId));
  };

  return (
    <AiCategoryTabs
      categories={categories}
      selected={selected}
      onSelect={onSelect}
      ariaLabel={t("Common:Category")}
      className={styles.row}
      dataTestId="ai-agent-categories"
      itemTestId="ai-agent-category"
    />
  );
};

export default inject(
  ({ filesStore, userStore }: TStore) => ({
    roomsFilter: filesStore.roomsFilter,
    folders: filesStore.folders as readonly TAgentItem[],
    userId: userStore.user?.id,
  }),
)(observer(AgentCategories));
