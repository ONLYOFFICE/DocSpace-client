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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import { useAiRoomStore, type AiRoomTab } from "../../_store";

const AiRoomTabs = () => {
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
    // page effect (folder discovery), and each tab's AliasFilesList drives
    // its own store/loader, so a global section-body loader isn't needed.
    if (!roomId) return;

    // Preserve unknown query params; drop fileId for non-result tabs so the
    // page hydration effect doesn't re-select a stale file.
    const params = new URLSearchParams(window.location.search);
    params.set("tab", id);
    if (id !== "result") params.delete("fileId");

    // Use replaceState instead of router.push: tab content is driven by
    // `aiRoomStore.currentTab` (MobX), so we don't need Next.js to re-run
    // the server component on each tab click. Routing through Next would
    // force-dynamic-fetch the page (search params changed) and re-stream
    // SectionBody, which visually nudges the surrounding navigation.
    // We just sync the URL bar for deep-link / refresh purposes — the
    // frame bridge re-emits `onNavigate` on the MobX `currentTab` change.
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);

    // Tabs with `withAnimation` starts the indicator bar via
    // `triggerAnimation`; PrimaryTabs only auto-finishes it when an
    // item has a per-item `onClick`. We use top-level `onSelect`, so
    // close the loop ourselves.
    //
    // Defer to the next tick: `triggerAnimation` queues
    // `setAnimationPhase("progress")` but the effect that handles
    // END_ANIMATION captures the old `animationPhase` value through its
    // closure — if we dispatch synchronously, the listener still sees
    // "none" and the bar is never finished. `setTimeout(..., 0)` lets
    // React flush the state update first.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }, 0);
  };

  // AIRoom namespace is not bundled in SDK i18n (Common-only). Pass
  // English defaults via `defaultValue` so labels render correctly when
  // the namespace is missing.
  const items: TTabItem[] = [
    {
      id: "chat",
      name: t("Common:AIChat", { defaultValue: "AI Chat" }),
      content: null,
    },
    {
      id: "knowledge",
      name: t("Common:Knowledge", { defaultValue: "Knowledge base" }),
      content: null,
    },
    {
      id: "result",
      name: t("Common:ResultStorage", { defaultValue: "Result Storage" }),
      content: null,
    },
  ];

  // The sticky 20px gap below the tabs is suppressed only on the Chat tab
  // (chat fills the body edge-to-edge). Knowledge / Result render the
  // standard files list, which expects the gap so the filter row doesn't
  // butt up against the tabs.
  const withoutStickyIntend = (currentTab ?? "chat") === "chat";

  return (
    <Tabs
      className="ai-room-tabs"
      selectedItemId={currentTab ?? "chat"}
      items={items}
      onSelect={onSelect}
      withAnimation
      withoutStickyIntend={withoutStickyIntend}
    />
  );
};

export default observer(AiRoomTabs);
