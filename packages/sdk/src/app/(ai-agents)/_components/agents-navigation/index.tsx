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
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  QuickActions,
  type QuickActionItem,
} from "@docspace/ui-kit/components/quick-actions";
import { CreateAgentIcon } from "@docspace/ui-kit/components/quick-actions/icons";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

import AgentsHeader from "../agents-header";
import AgentsFilter from "../agents-filter";
import AliasFilesFilter from "../alias-files-filter";
import AiRoomTabs from "../ai-room-tabs";
import SettingsTabs from "../settings-tabs";
import {
  useAgentDialogsStore,
  useAgentsAIConfigStore,
  useAgentsListStore,
  useAgentsUserStore,
  useAiRoomStore,
  useFavoritesFilesStore,
  useKnowledgeFilesStore,
  useRecentFilesStore,
  useTrashFilesStore,
} from "../../_store";
import useKnowledgeUpload from "../../_hooks/useKnowledgeUpload";
import styles from "../agents-list/AgentsList.module.scss";

// Single client component rendered from `(ai-agents)/layout.client.tsx` that
// picks the header/filter/submenu content from `usePathname()`. Replaces the
// three parallel route slots (@header / @filter / @submenu) which used to
// remount on every navigation — that caused the visible flicker in the
// section bars. Living under the layout means React keeps these mounted as
// long as the segment is active; only the body slot changes.

type Route =
  | "root"
  | "recent"
  | "favorites"
  | "trash"
  | "settings"
  | "agent"
  | "other";

const matchRoute = (pathname: string | null): Route => {
  if (!pathname) return "other";
  if (pathname === "/ai-agents") return "root";
  if (pathname === "/ai-agents/recent") return "recent";
  if (pathname === "/ai-agents/favorites") return "favorites";
  if (pathname === "/ai-agents/trash") return "trash";
  if (pathname.startsWith("/ai-agents/settings")) return "settings";
  if (/^\/ai-agents\/[^/]+$/.test(pathname)) return "agent";
  return "other";
};

// ---------- Header ----------

const HeaderArea = observer(({ route }: { route: Route }) => {
  const { t } = useTranslation(["Common"]);
  const router = useRouter();
  const listStore = useAgentsListStore();
  const trashStore = useTrashFilesStore();
  const aiRoomStore = useAiRoomStore();

  if (route === "agent") {
    const goToList = () => router.push("/ai-agents");
    return (
      <AgentsHeader
        title={aiRoomStore.title}
        navigationItems={[
          {
            id: "ai-agents",
            title: t("Common:AIAgents", { defaultValue: "AI Agents" }),
            isRootRoom: true,
          },
        ]}
        onBackToParentFolder={goToList}
        onClickFolder={() => goToList()}
      />
    );
  }

  if (route === "settings") {
    return <AgentsHeader title={t("Common:Settings")} />;
  }

  if (route === "trash") {
    const isEmpty =
      !trashStore.isLoading &&
      trashStore.files.length === 0 &&
      trashStore.folders.length === 0;
    return (
      <AgentsHeader title={t("Common:TrashSection")} isEmptyList={isEmpty} />
    );
  }

  // Root / Recent / Favorites all derive the "empty" badge from the agents
  // list store — mirrors the pre-refactor per-route slot pages.
  const isEmpty = !listStore.isLoading && listStore.agents.length === 0;

  if (route === "recent") {
    return <AgentsHeader title={t("Common:Recent")} isEmptyList={isEmpty} />;
  }
  if (route === "favorites") {
    return <AgentsHeader title={t("Common:Favorites")} isEmptyList={isEmpty} />;
  }
  if (route === "root") {
    return (
      <AgentsHeader
        title={t("Common:AIAgents", { defaultValue: "AI Agents" })}
        isEmptyList={isEmpty}
      />
    );
  }
  return null;
});

// ---------- Filter ----------

const RootFilter = observer(() => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useAgentDialogsStore();
  const userStore = useAgentsUserStore();
  const aiConfigStore = useAgentsAIConfigStore();

  const onCreate = React.useCallback(() => {
    dialogsStore.setCreateAgentDialogVisible(true);
  }, [dialogsStore]);

  const mainButtonProps = React.useMemo<MainButtonProps>(
    () => ({
      isDropdown: false,
      model: [],
      onAction: onCreate,
      text: t("Common:NewAgent", { defaultValue: "New agent" }),
    }),
    [t, onCreate],
  );

  const quickActionItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-new-agent",
        icon: <CreateAgentIcon />,
        label: t("Common:NewAgent", { defaultValue: "New agent" }),
        onClick: onCreate,
      },
    ],
    [t, onCreate],
  );

  const { user } = userStore;
  const canManage = !!(user?.isAdmin || user?.isOwner || user?.isRoomAdmin);
  const showCreateButton = canManage;

  if (!aiConfigStore.aiReady) return null;

  return (
    <>
      {showCreateButton && (
        <QuickActions items={quickActionItems} className={styles.quickActions} />
      )}
      <AgentsFilter
        showMainButton={showCreateButton}
        mainButtonProps={showCreateButton ? mainButtonProps : undefined}
      />
    </>
  );
});

// Knowledge tab filter: same alias-files filter UI as Recent/Favorites,
// plus an Upload main-button dropdown with two items ("From device" /
// "From {{productName}}"). Mirrors the client's Article MainButton
// pattern for room folders. Upload handlers are stubs for now — wiring
// them to the chunked-upload session pipeline is a separate task.
const KnowledgeFilter = observer(() => {
  const { t } = useTranslation(["Common"]);
  const { onUploadFromDocSpace, onUploadFromDevice } = useKnowledgeUpload();

  const uploadMenuModel = React.useMemo<ContextMenuModel[]>(
    () => [
      {
        id: "knowledge-upload-from-docspace",
        key: "knowledge-upload-from-docspace",
        label: t("Common:FromPortal"),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFromDocSpace,
      },
      {
        id: "knowledge-upload-from-device",
        key: "knowledge-upload-from-device",
        label: t("Common:FromDevice", { defaultValue: "From device" }),
        icon: ActionsUploadReactSvgUrl,
        onClick: onUploadFromDevice,
      },
    ],
    [t, onUploadFromDocSpace, onUploadFromDevice],
  );

  const mainButtonProps = React.useMemo<MainButtonProps>(
    () => ({
      isDropdown: true,
      model: uploadMenuModel,
      text: t("Common:Upload", { defaultValue: "Upload" }),
    }),
    [t, uploadMenuModel],
  );

  return (
    <AliasFilesFilter
      config={{
        useStore: useKnowledgeFilesStore,
        includeFoldersFilesArchivesInType: true,
      }}
      showMainButton
      mainButtonProps={mainButtonProps}
    />
  );
});

const FilterArea = observer(({ route }: { route: Route }) => {
  const aiRoomStore = useAiRoomStore();
  if (route === "root") return <RootFilter />;
  if (route === "recent") {
    return (
      <AliasFilesFilter
        config={{
          useStore: useRecentFilesStore,
          includeFoldersFilesArchivesInType: false,
          isRecentFolder: true,
        }}
      />
    );
  }
  if (route === "favorites") {
    return (
      <AliasFilesFilter
        config={{
          useStore: useFavoritesFilesStore,
          includeFoldersFilesArchivesInType: true,
          isFavoritesFolder: true,
        }}
      />
    );
  }
  if (route === "trash") {
    return (
      <AliasFilesFilter
        config={{
          useStore: useTrashFilesStore,
          includeFoldersFilesArchivesInType: true,
          hideAuthor: true,
        }}
      />
    );
  }
  if (route === "agent" && aiRoomStore.currentTab === "knowledge") {
    return <KnowledgeFilter />;
  }
  return null;
});

// ---------- Submenu ----------

const SubmenuArea = observer(({ route }: { route: Route }) => {
  if (route === "agent") return <AiRoomTabs />;
  if (route === "settings") return <SettingsTabs />;
  return null;
});

// ---------- Public ----------

export const AgentsNavigationHeader = observer(() => {
  const pathname = usePathname();
  return <HeaderArea route={matchRoute(pathname)} />;
});

export const AgentsNavigationFilter = observer(() => {
  const pathname = usePathname();
  return <FilterArea route={matchRoute(pathname)} />;
});

export const AgentsNavigationSubmenu = observer(() => {
  const pathname = usePathname();
  return <SubmenuArea route={matchRoute(pathname)} />;
});
