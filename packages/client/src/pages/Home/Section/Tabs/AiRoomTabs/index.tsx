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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";
import FilesFilter from "@docspace/shared/api/files/filter";
import { SearchArea } from "@docspace/shared/enums";

import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import AiRoomStore from "SRC_DIR/store/AiRoomStore";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "@docspace/shared/constants";
import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";

type AiRoomTabsProps = {
  id?: SelectedFolderStore["id"];
  rootRoomId?: SelectedFolderStore["rootRoomId"];

  currentClientView?: ClientLoadingStore["currentClientView"];
  showTabsLoader?: ClientLoadingStore["showTabsLoader"];
  showArticleLoader?: ClientLoadingStore["showArticleLoader"];
  setIsSectionBodyLoading?: ClientLoadingStore["setIsSectionBodyLoading"];

  currentTab?: AiRoomStore["currentTab"];
  setCurrentTab: AiRoomStore["setCurrentTab"];
  setKnowledgeId: AiRoomStore["setKnowledgeId"];
  setResultId: AiRoomStore["setResultId"];
};

const AiRoomTabs = ({
  id,
  rootRoomId,

  showTabsLoader,
  showArticleLoader,
  currentClientView,
  setIsSectionBodyLoading,

  currentTab,
  setCurrentTab,

  setKnowledgeId,
  setResultId,
}: AiRoomTabsProps) => {
  const navigate = useNavigate();

  const { t } = useTranslation(["AIRoom", "Common"]);

  useEffect(() => {
    return () => {
      const currentSearch = new URLSearchParams(window.location.search);

      const chatId = currentSearch.get("chat");

      if (chatId) {
        currentSearch.delete("chat");
      }

      const searchString = currentSearch.toString();
      const newUrl = searchString
        ? `${window.location.pathname}?${searchString}`
        : window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    };
  }, []);

  const onSelect = (tab: TTabItem) => {
    setCurrentTab(tab.id as "chat" | "knowledge" | "result");

    const filesFilter = FilesFilter.getDefault();

    filesFilter.folder = rootRoomId?.toString() || id?.toString() || "";

    if (tab.id === "chat") {
      const path = getCategoryUrl(CategoryType.Chat, rootRoomId || id);

      filesFilter.searchArea = SearchArea.Any;

      setKnowledgeId(null);
      setResultId(null);

      navigate(`${path}?${filesFilter.toUrlParams()}`);
    } else {
      setResultId(null);
      setKnowledgeId(null);

      const path = getCategoryUrl(CategoryType.AIAgent, rootRoomId || id);

      filesFilter.searchArea =
        tab.id === "knowledge"
          ? SearchArea.Knowledge
          : SearchArea.ResultStorage;

      setIsSectionBodyLoading?.(true, false);

      navigate(`${path}?${filesFilter.toUrlParams()}`);
    }
  };

  const items: TTabItem[] = [
    {
      id: "chat",
      name: t("AIChat"),
      content: null,
    },
    {
      id: "knowledge",
      name: t("Knowledge"),
      content: null,
    },
    {
      id: "result",
      name: t("ResultStorage"),
      content: null,
    },
  ];

  const isChat = currentClientView === "chat";

  if (showTabsLoader || showArticleLoader)
    return (
      <SectionSubmenuSkeleton style={{ marginBottom: isChat ? 0 : "20px" }} />
    );

  return (
    <Tabs
      className="ai-room-tabs"
      selectedItemId={currentTab ?? "chat"}
      items={items}
      onSelect={onSelect}
      withoutStickyIntend={currentClientView === "chat"}
      withAnimation
    />
  );
};

export default inject(
  ({
    clientLoadingStore,
    aiRoomStore,
    selectedFolderStore,
    accessRightsStore,
  }: TStore) => {
    const {
      showTabsLoader,
      showArticleLoader,
      setIsSectionBodyLoading,
      currentClientView,
    } = clientLoadingStore;

    const { currentTab, setCurrentTab, setKnowledgeId, setResultId } =
      aiRoomStore;

    const { id, rootRoomId } = selectedFolderStore;

    return {
      id,
      rootRoomId,

      showTabsLoader,
      showArticleLoader,
      setIsSectionBodyLoading,

      currentTab,
      setCurrentTab,

      setKnowledgeId,
      setResultId,

      currentClientView,
    };
  },
)(observer(AiRoomTabs));
