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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { AsideHeader } from "@docspace/ui-kit/components/aside";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";

import { useAgentInfoPanelStore, type AgentInfoPanelView } from "../../_store";

import DetailsView from "./views/details";
import MembersView from "./views/members";
import HistoryView from "./views/history";
import styles from "./InfoPanel.module.scss";

/**
 * Top-of-aside header — title + close button. Designed to be placed inside
 * `<Section.InfoPanelHeader>`; Section already provides the aside chrome /
 * positioning.
 */
export const AgentInfoPanelHeader = observer(() => {
  const { t } = useTranslation(["Common"]);
  const { hide, currentAgent } = useAgentInfoPanelStore();

  if (!currentAgent) return null;

  return (
    <AsideHeader
      header={t("Common:Info", { defaultValue: "Info" })}
      onCloseClick={hide}
      withoutBorder
      isCloseable
      dataTestId="agent_info_panel_header"
    />
  );
});

/**
 * Info-panel body content: section tabs (Contacts / History / Details),
 * agent title row, and the selected view. Placed inside
 * `<Section.InfoPanelBody>`.
 */
export const AgentInfoPanelBody = observer(() => {
  const { t } = useTranslation(["Common", "InfoPanel"]);
  const { currentAgent, view, setView } = useAgentInfoPanelStore();

  if (!currentAgent) return null;

  const tabItems = [
    {
      id: "members" as AgentInfoPanelView,
      name: t("Common:Contacts", { defaultValue: "Contacts" }),
      content: null,
      onClick: () => setView("members"),
    },
    {
      id: "history" as AgentInfoPanelView,
      name: t("Common:SubmenuHistory", { defaultValue: "History" }),
      content: null,
      onClick: () => setView("history"),
    },
    {
      id: "details" as AgentInfoPanelView,
      name: t("Common:AgentInfo", { defaultValue: "Details" }),
      content: null,
      onClick: () => setView("details"),
    },
  ];

  return (
    <div className={styles.bodyRoot} data-testid="agent_info_panel_body">
      <div className={styles.tabs}>
        <Tabs
          style={{ width: "100%" }}
          items={tabItems}
          selectedItemId={view}
          onSelect={(item) => setView(item.id as AgentInfoPanelView)}
        />
      </div>

      <div className={styles.titleRow}>
        <div className={styles.titleRowIcon}>
          <RoomIcon
            color={currentAgent.logo?.color}
            title={currentAgent.title || ""}
            isArchive={Boolean(currentAgent.isArchive)}
            size="32px"
            radius="6px"
            showDefault={
              !currentAgent.logo?.medium && !currentAgent.logo?.cover
            }
            logo={currentAgent.logo?.medium || currentAgent.logo}
          />
        </div>
        <div className={styles.titleRowName} title={currentAgent.title}>
          {currentAgent.title}
        </div>
      </div>

      <div className={styles.body}>
        {view === "details" ? (
          <DetailsView />
        ) : view === "history" ? (
          <HistoryView />
        ) : (
          <MembersView />
        )}
      </div>
    </div>
  );
});

