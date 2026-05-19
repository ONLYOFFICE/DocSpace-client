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
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";

import { useAiRoomStore, type AiRoomTab } from "../../_store";

const AiRoomTabs = () => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);

  const aiRoomStore = useAiRoomStore();
  const { currentTab, roomId, setCurrentTab } = aiRoomStore;

  // Clear `chat` query param on unmount — port of the original AiRoomTabs
  // cleanup so the URL doesn't keep a stale chat id around after navigation.
  React.useEffect(() => {
    return () => {
      const currentSearch = new URLSearchParams(window.location.search);
      if (currentSearch.has("chat")) {
        currentSearch.delete("chat");
        const searchString = currentSearch.toString();
        const newUrl = searchString
          ? `${window.location.pathname}?${searchString}`
          : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    };
  }, []);

  const onSelect = (tab: TTabItem) => {
    const id = tab.id as AiRoomTab;
    setCurrentTab(id);

    // Don't touch knowledgeId/resultId here — they're owned by the parent
    // page effect (folder discovery), and AgentFilesList renders its own
    // per-slot loader, so a global section-body loader isn't needed either.
    if (!roomId) return;

    // Preserve unknown query params; drop fileId for non-result tabs so the
    // page hydration effect doesn't re-select a stale file.
    const params = new URLSearchParams(window.location.search);
    params.set("tab", id);
    if (id !== "result") params.delete("fileId");
    router.push(`/ai-agents/${roomId}?${params.toString()}`);
  };

  // AIRoom namespace is not bundled in SDK i18n (Common-only). Pass
  // English defaults via `defaultValue` so labels render correctly when
  // the namespace is missing.
  const items: TTabItem[] = [
    {
      id: "chat",
      name: t("AIRoom:AIChat", { defaultValue: "AI Chat" }),
      content: null,
    },
    {
      id: "knowledge",
      name: t("AIRoom:Knowledge", { defaultValue: "Knowledge base" }),
      content: null,
    },
    {
      id: "result",
      name: t("AIRoom:ResultStorage", { defaultValue: "Result Storage" }),
      content: null,
    },
  ];

  return (
    <Tabs
      className="ai-room-tabs"
      selectedItemId={currentTab ?? "chat"}
      items={items}
      onSelect={onSelect}
      withAnimation
    />
  );
};

export default observer(AiRoomTabs);
