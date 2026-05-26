// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";

import { useAgentsUserStore } from "../../_store/AgentsUserStore";
import { useAgentsCommonData } from "../../_store/AgentsCommonDataContext";

const VALID_TABS = [
  "billing",
  "providers",
  "servers",
  "search",
  "knowledge",
] as const;
type TabId = (typeof VALID_TABS)[number];

const getTabIdFromPath = (path: string | null, defaultTab: TabId): TabId => {
  if (!path) return defaultTab;
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return (VALID_TABS as readonly string[]).includes(last)
    ? (last as TabId)
    : defaultTab;
};

// Settings sub-menu — Tabs strip rendered into `<Section.SectionSubmenu>`.
// `content: null` on every tab item: this is navigation only; the body is
// rendered by the regular `settings/[tab]/page.tsx`.
export const SettingsTabs = observer(function SettingsTabs() {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAgentsUserStore();

  const { portalSettings } = useAgentsCommonData();
  const standalone = Boolean(portalSettings?.standalone);

  const canSeeBilling = !standalone && Boolean(user?.isAdmin || user?.isOwner);
  const defaultTab: TabId = standalone ? "providers" : "billing";
  const currentTabId = getTabIdFromPath(pathname, defaultTab);

  const items: TTabItem[] = [
    ...(canSeeBilling
      ? [
          {
            id: "billing",
            name: t("Common:Billing"),
            content: null,
          },
        ]
      : []),
    { id: "providers", name: t("Common:AIProvider"), content: null },
    { id: "servers", name: t("Common:MCPSettingTitle"), content: null },
    { id: "search", name: t("Common:WebSearchAI"), content: null },
    { id: "knowledge", name: t("Common:Knowledge"), content: null },
  ];

  const onSelect = (element: TTabItem) => {
    router.push(`/ai-agents/settings/${element.id}`);
  };

  return (
    <Tabs
      items={items}
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop="0"
      withoutStickyIntend
    />
  );
});

export default SettingsTabs;
