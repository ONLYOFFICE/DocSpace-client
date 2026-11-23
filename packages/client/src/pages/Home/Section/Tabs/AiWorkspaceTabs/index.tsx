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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { Tabs, TTabItem } from "@onlyoffice/apps-ui-kit/components/tabs";
import { RoomsType } from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";
import { getCategoryType } from "@docspace/shared/utils/common";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";

import {
  getAiWorkspaceTabUrl,
  hasAiWorkspaceTemplates,
  isAiWorkspaceTemplates,
} from "SRC_DIR/helpers/aiWorkspace";

const MY_TAB = "my";
const TEMPLATES_TAB = "templates";

type AiWorkspaceTabsProps = {
  userId?: string;
  /** The section is loading: the header, and the tabs with it, are skeletons. */
  showLoader?: boolean;
};

/**
 * The tabs over the filter of the AI Chat section's Agents list: the user's
 * own agents and the shipped agent templates. Both stay on the list's
 * address, so the sidebar entry and the title do not change; the tab is read
 * from its query. Skill sets and Knowledge bases have no templates and so no
 * tabs. While the section loads - a reload, a slow change of section - the
 * tabs are a skeleton, as the header above and the filter below them are.
 */
export const AiWorkspaceTabs = ({ userId, showLoader }: AiWorkspaceTabsProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();

  if (getCategoryType(location) !== CategoryType.AiHub) return null;
  if (!hasAiWorkspaceTemplates(location.search)) return null;

  if (showLoader) return <SectionSubmenuSkeleton />;

  const items: TTabItem[] = [
    { id: MY_TAB, name: t("Common:MyAgents"), content: null },
    { id: TEMPLATES_TAB, name: t("Common:Templates"), content: null },
  ];

  const selectedId = isAiWorkspaceTemplates(location.search)
    ? TEMPLATES_TAB
    : MY_TAB;

  const onSelect = (item: TTabItem) => {
    if (item.id === selectedId) return;

    navigate(
      getAiWorkspaceTabUrl(
        item.id === TEMPLATES_TAB,
        RoomsType.AiProjectRoom,
        userId,
      ),
    );
  };

  return (
    <Tabs
      items={items}
      selectedItemId={selectedId}
      onSelect={onSelect}
      withAnimation
    />
  );
};

export default inject(({ userStore, clientLoadingStore }: TStore) => ({
  userId: userStore.user?.id,
  showLoader:
    clientLoadingStore.showTabsLoader || clientLoadingStore.showArticleLoader,
}))(observer(AiWorkspaceTabs));
