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

import React from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";
import { getBrandName } from "@docspace/shared/constants/brands";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import ChatNoAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.light.svg";
import ChatNoAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.dark.svg";

import { useAgentsUserStore } from "../../../_store";

// Port of client `KnowledgeDisabledContainer` (components/EmptyContainer/
// KnowledgeDisabledContainer.js). Shown inside the Knowledge tab when
// vectorization is disabled in the portal (no embedding provider) — the
// server rejects every copy/move/create into the folder, so even the
// regular empty view's Upload CTAs would be useless.
//
// For admins we surface a "Go to settings" button targeting the SDK's
// knowledge settings route; regular users see just the message.
const KnowledgeDisabledContainer = observer(() => {
  const { t } = useTranslation(["Common"]);
  const router = useRouter();
  const { isBase } = useTheme();

  const userStore = useAgentsUserStore();

  const isAdmin = !!(userStore.user?.isAdmin || userStore.user?.isOwner);

  // Defer theme-dependent rendering until the client has mounted so the
  // server's default-theme SSR doesn't mismatch a non-default client
  // theme. Same pattern as AgentsEmptyView / NoAgentItem.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const useLightIcon = !mounted || isBase;

  const title = t("Common:KnowledgeUnavailable", {
    defaultValue: "Knowledge is unavailable",
  });

  const description = isAdmin
    ? t("Common:KnowledgeUnavailableDescription", {
        productName: getBrandName("ProductName"),
        aiAgents: t("Common:AIAgents"),
        defaultValue:
          "Configure a vectorization provider in {{productName}} to use Knowledge in {{aiAgents}}.",
      })
    : t("Common:KnowledgeUnavailableDescriptionUser", {
        productName: getBrandName("ProductName"),
        aiAgents: t("Common:AIAgents"),
        defaultValue:
          "Ask your {{productName}} admin to enable vectorization to use Knowledge in {{aiAgents}}.",
      });

  const goToSettings = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    // Navigate straight to the settings route. Don't pre-clear the
    // aiRoomStore tab/knowledgeId — those MobX writes would re-render
    // AiAgentView synchronously, flashing the chat tab for a tick
    // before the Next.js navigation tears the page down. The agent
    // detail useEffect already resets that state on next entry.
    router.push("/ai-agents/settings/knowledge");
  };

  return (
    <EmptyViewComponent
      title={title}
      description={description}
      icon={
        useLightIcon ? (
          <ChatNoAccessRightsLightIcon />
        ) : (
          <ChatNoAccessRightsDarkIcon />
        )
      }
      options={
        isAdmin
          ? [
              {
                type: "button",
                onClick: goToSettings,
                key: "disabled-view-go-to-settings",
                title: t("Common:GoToSettings", {
                  defaultValue: "Go to settings",
                }),
              },
            ]
          : []
      }
    />
  );
});

export default KnowledgeDisabledContainer;
