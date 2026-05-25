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
import dynamic from "next/dynamic";

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
  type TOptSocket,
} from "@docspace/ui-kit/utils/socket";
import type { TAgent, TAIConfig } from "@docspace/shared/api/ai/types";

import {
  useAgentsListStore,
  useAgentDialogsStore,
  useAgentsAIConfigStore,
} from "../_store";
import useAiAgentsPageInit from "../_hooks/useAiAgentsPageInit";
import useAiAgentsFrameBridge from "../_hooks/useAiAgentsFrameBridge";

import AgentsList from "../_components/agents-list";
import type { AgentsListSection } from "../_components/agents-section-empty-view";

const CreateAgentEvent = dynamic(
  () => import("../_components/agent-events/CreateAgentEvent"),
  { ssr: false },
);
const EditAgentEvent = dynamic(
  () => import("../_components/agent-events/EditAgentEvent"),
  { ssr: false },
);

type Props = {
  initialSearch: string;
  section?: AgentsListSection;
  initialAgents?: TAgent[];
  initialTotal?: number;
  initialRootFolderId?: number | null;
  initialAIConfig?: TAIConfig | null;
};

export type { AgentsListSection };

const AgentsListPage = ({
  initialSearch,
  section,
  initialAgents,
  initialTotal,
  initialRootFolderId,
  initialAIConfig,
}: Props) => {
  const store = useAgentsListStore();
  const dialogsStore = useAgentDialogsStore();
  const aiConfigStore = useAgentsAIConfigStore();

  useAiAgentsPageInit();
  useAiAgentsFrameBridge(true, null);

  // Synchronously hydrate the list + AI config stores from SSR data so the
  // first render already has everything — no client fetch on mount, no
  // loader flash. Subsequent updates are driven by AgentsFilter callbacks
  // (which call store.fetchAgents) and socket-driven refetches below.
  //
  // If SSR data is missing (e.g. the server-side fetch failed / 401), we
  // fall through to the client-side fetch in the useEffect below — keeps
  // the page usable even when SSR can't authenticate.
  const ssrHydrated = React.useRef(false);
  if (!ssrHydrated.current && initialAgents !== undefined && initialAIConfig) {
    ssrHydrated.current = true;
    const filter = store.filter.clone();
    if (initialSearch) filter.filterValue = initialSearch;
    filter.total = initialTotal ?? 0;
    store.setFilter(filter);
    store.setAgents(initialAgents, initialTotal ?? 0);
    if (initialRootFolderId != null) store.setRootFolderId(initialRootFolderId);
    store.setIsLoading(false);
    aiConfigStore.setAIConfig(initialAIConfig);
  }

  // Fallback client-side initial fetch — runs only if SSR didn't hydrate
  // (initialAgents/initialAIConfig undefined or null). Same behavior as
  // before SSR was added.
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (didInit.current || ssrHydrated.current) return;
    didInit.current = true;
    const filter = store.filter.clone();
    if (initialSearch) filter.filterValue = initialSearch;
    void Promise.all([
      store.fetchAgents(filter),
      aiConfigStore.fetchAIConfig(),
    ]);
  }, [initialSearch, store, aiConfigStore]);

  // Live-refresh the list when an agent is created/updated/deleted (either
  // from the current tab or another). Mirrors client FilesStore handling of
  // `s:modify-folder` — subscribes to the AI-agents root `DIR-{id}` room and
  // refetches on matching events. Debounced so a burst (bulk delete) collapses
  // into one refetch.
  const rootFolderId = store.rootFolderId;
  React.useEffect(() => {
    if (rootFolderId == null) return;

    const room = `DIR-${rootFolderId}`;
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: room,
      individual: true,
    });

    let pending: number | null = null;
    const refetch = () => {
      if (pending !== null) return;
      pending = window.setTimeout(() => {
        pending = null;
        void store.fetchAgents();
      }, 200);
    };

    const handler = (opt?: TOptSocket) => {
      if (!opt?.data) return;
      let data: { folderId?: number; parentId?: number; id?: number };
      try {
        data = JSON.parse(opt.data);
      } catch {
        return;
      }
      const matches =
        data.folderId === rootFolderId ||
        data.parentId === rootFolderId ||
        data.id === rootFolderId;
      if (!matches) return;
      if (
        opt.cmd === "create" ||
        opt.cmd === "update" ||
        opt.cmd === "delete"
      ) {
        refetch();
      }
    };

    // ChangedQuotaUsedValue — mirrors client FilesStore: when the portal
    // emits a room-feature quota update, refetch the list (the iframe path
    // is the only one this fires on in the client too).
    const quotaHandler = (res?: TOptSocket) => {
      if (res && (res as { featureId?: string }).featureId === "room") {
        refetch();
      }
    };

    SocketHelper?.on(SocketEvents.ModifyFolder, handler);
    SocketHelper?.on(SocketEvents.ChangedQuotaUsedValue, quotaHandler);

    return () => {
      if (pending !== null) window.clearTimeout(pending);
      SocketHelper?.off(SocketEvents.ModifyFolder, handler);
      SocketHelper?.off(SocketEvents.ChangedQuotaUsedValue, quotaHandler);

      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: room,
        individual: true,
      });
    };
  }, [rootFolderId, store]);

  return (
    <>
      {store.isLoading || !aiConfigStore.isLoaded ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Loader type={LoaderTypes.dualRing} size="40px" />
        </div>
      ) : (
        <AgentsList agents={store.agents} section={section} />
      )}

      {dialogsStore.createAgentDialogVisible ? (
        <CreateAgentEvent
          visible={dialogsStore.createAgentDialogVisible}
          onClose={() => dialogsStore.setCreateAgentDialogVisible(false)}
          portalMcpServerId={aiConfigStore.aiConfig?.portalMcpServerId}
        />
      ) : null}

      {dialogsStore.editAgentDialogVisible && dialogsStore.editingAgent ? (
        <EditAgentEvent
          visible={dialogsStore.editAgentDialogVisible}
          onClose={() => dialogsStore.setEditAgentDialogVisible(false, null)}
          item={dialogsStore.editingAgent}
        />
      ) : null}
    </>
  );
};

export default observer(AgentsListPage);

