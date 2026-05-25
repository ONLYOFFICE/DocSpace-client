// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";
import { runInAction } from "mobx";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { setAuthToken } from "@docspace/shared/api/client";
import { toastr } from "@docspace/ui-kit/components/toast";
import Section from "@docspace/ui-kit/components/section";
import { FloatingButton } from "@docspace/ui-kit/components/floating-button";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";
import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TDefaultProvider } from "@docspace/shared/api/ai/types";
import type { TViewAs } from "@docspace/shared/types";

import { Layout as DocspaceFilesLayout } from "@/app/(docspace)/_components/layout";

import useDeviceType from "@/hooks/useDeviceType";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";

import {
  AiAgentsStoreProviders,
  useAgentInfoPanelStore,
  useAgentDialogsStore,
  useAgentsListStore,
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useAiRoomStore,
} from "./_store";
import DeleteAgentDialog from "./_components/delete-agent-dialog";
import LeaveAgentDialog from "./_components/leave-agent-dialog";
import {
  AgentInfoPanelBody,
  AgentInfoPanelHeader,
} from "./_components/info-panel";
import {
  AgentsNavigationFilter,
  AgentsNavigationHeader,
  AgentsNavigationSubmenu,
} from "./_components/agents-navigation";
import KnowledgeUploadSelectorDialog from "./_components/knowledge-upload-selector-dialog";
import { AgentsCommonDataProvider } from "./_store/AgentsCommonDataContext";
import useAiAgentsFrameBridge from "./_hooks/useAiAgentsFrameBridge";
import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";
// UploadPanel is the side-aside list of in-flight uploads; it depends
// only on UploadStore + ui-kit primitives, so it's safe to share with
// the ai-agents Knowledge upload pipeline.
import UploadPanel from "@/app/(personal-files)/_components/upload-panel";

// Imported only for side effects: cross-route CSS overrides that need to
// out-rank per-page chunks in the cascade.
import "./AiAgentsLayout.module.scss";

export type AiAgentsCommonData = {
  authToken: string;
  roomId: string;
  socketUrl: string;
  filesSettings: TFilesSettings;
  user: TUser | undefined;
  defaultProvider: TDefaultProvider | undefined;
  portalSettings: TSettings | undefined;
  initialViewAs: TViewAs;
};

type Props = {
  commonData: AiAgentsCommonData;
  children: React.ReactNode;
};

const AgentLifecycleDialogs = observer(() => {
  const dialogsStore = useAgentDialogsStore();
  const listStore = useAgentsListStore();
  const userStore = useAgentsUserStore();

  const { deleteAgentDialogState, leaveAgentDialogState } = dialogsStore;

  return (
    <>
      {deleteAgentDialogState.visible && deleteAgentDialogState.agent ? (
        <DeleteAgentDialog
          visible
          agentName={deleteAgentDialogState.agent.title}
          onClose={() => dialogsStore.setDeleteAgentDialogVisible(false)}
          onConfirm={() => {
            const agent = deleteAgentDialogState.agent;
            if (!agent) return;
            dialogsStore.setDeleteAgentDialogVisible(false);
            void listStore.deleteAgent(agent.id).catch((e) => {
              toastr.error(e instanceof Error ? e.message : String(e));
            });
          }}
        />
      ) : null}

      {leaveAgentDialogState.visible && leaveAgentDialogState.agent ? (
        <LeaveAgentDialog
          visible
          isOwner={leaveAgentDialogState.isOwner}
          onClose={() => dialogsStore.setLeaveAgentDialogVisible(false)}
          onConfirm={() => {
            const agent = leaveAgentDialogState.agent;
            const currentUserId = userStore.user?.id;
            if (!agent || !currentUserId) return;
            dialogsStore.setLeaveAgentDialogVisible(false);
            if (leaveAgentDialogState.isOwner) return;
            void listStore.leaveAgent(agent.id, currentUserId).catch((e) => {
              toastr.error(e instanceof Error ? e.message : String(e));
            });
          }}
        />
      ) : null}
    </>
  );
});

const SectionShell = observer(
  ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const { currentDeviceType } = useDeviceType();
    const { frameHeaderVars } = useFrameHeaderConfig();
    const infoPanel = useAgentInfoPanelStore();
    const aiRoomStore = useAiRoomStore();
    const pathname = usePathname() ?? "";

    const isInfoVisible = infoPanel.isVisible && !!infoPanel.currentAgent;

    // Only the chat tab needs `settingsStudio` paddings (chat fills the body
    // edge-to-edge). Knowledge / Result tabs render the standard files list,
    // which expects the regular section paddings + column header — forcing
    // studio mode there strips the top padding and squashes the table.
    const isAgentDetail = /\/ai-agents\/(?!settings(?:$|\/)|recent$|favorites$|trash$)[^/]+$/.test(
      pathname,
    );
    const isAgentChat = isAgentDetail && aiRoomStore.currentTab === "chat";

    return (
      <div
        style={{
          ...frameHeaderVars,
          display: "flex",
          width: "100%",
          height: "100dvh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Section
          currentDeviceType={currentDeviceType}
          isInfoPanelAvailable={isInfoVisible}
          isInfoPanelVisible={isInfoVisible}
          setIsInfoPanelVisible={(visible) => {
            if (!visible) infoPanel.hide();
          }}
          canDisplay={isInfoVisible}
          withBodyScroll
          uploadFiles={false}
          settingsStudio={isAgentChat}
        >
          <Section.SectionHeader>
            <AgentsNavigationHeader />
          </Section.SectionHeader>
          <Section.SectionFilter>
            <AgentsNavigationFilter />
          </Section.SectionFilter>
          <Section.SectionSubmenu>
            <AgentsNavigationSubmenu />
          </Section.SectionSubmenu>
          <Section.SectionBody>{children}</Section.SectionBody>
          <Section.InfoPanelHeader>
            <AgentInfoPanelHeader />
          </Section.InfoPanelHeader>
          <Section.InfoPanelBody>
            <AgentInfoPanelBody />
          </Section.InfoPanelBody>
        </Section>
      </div>
    );
  },
);

const AiAgentsBootstrap = ({
  commonData,
  children,
}: {
  commonData: AiAgentsCommonData;
  children: React.ReactNode;
}) => {
  const userStore = useAgentsUserStore();
  const aiConfigStore = useAgentsAIConfigStore();

  const [queryClient] = React.useState(() => new QueryClient());

  // Initial fetch + socket subscription. Previously aiConfig was only
  // hydrated by the root list page (SSR data + client fallback), so a
  // direct entry into agent detail (e.g. parent's `?agentId=N`, or
  // postMessage-driven navigation that skips the root) left `aiReady`
  // false and the chat wouldn't render. The fetcher de-dupes in-flight
  // requests, so doing it here on top of the root page's SSR hydration is
  // safe — the root page short-circuits if data is already loaded.
  React.useEffect(() => {
    void aiConfigStore.fetchAIConfig();

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "change-ai-config",
    });

    const handleAiConfigChanged = () => {
      void aiConfigStore.fetchAIConfig({ force: true });
    };

    SocketHelper?.on(SocketEvents.ChangeAiConfig, handleAiConfigChanged);
    return () => {
      SocketHelper?.off(SocketEvents.ChangeAiConfig, handleAiConfigChanged);
    };
  }, [aiConfigStore]);

  // Hydrate user as a layout effect — pre-paint so there's no visible
  // flicker, but outside render so React 19's "setState during render"
  // tripwire doesn't flag the observable mutation (the previous in-render
  // assignment notified observer subscribers while they were mounting).
  const hydratedUser = React.useRef(false);
  React.useLayoutEffect(() => {
    if (hydratedUser.current || !commonData.user) return;
    hydratedUser.current = true;
    runInAction(() => userStore.setUser(commonData.user!));
  }, [commonData.user, userStore]);

  const authTokenSet = React.useRef(false);
  React.useEffect(() => {
    const token = commonData.authToken;
    if (token && !authTokenSet.current) {
      authTokenSet.current = true;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `asc_auth_key=${token}; path=/; SameSite=Lax${secure}`;
      setAuthToken(token);
    }
  }, [commonData.authToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AgentLifecycleDialogs />
      <KnowledgeUploadSelectorDialog />
      <UploadPanel />
      <UploadFloatingButton />
      <FrameBridgeHost />
    </QueryClientProvider>
  );
}

// Floating progress indicator for the Knowledge upload pipeline. Mirrors
// the Docs layout: shows while there are items in the upload store and
// opens the side panel on click. Stays mounted at the layout level so it
// survives tab/agent switches and isn't tied to the Knowledge route slot.
const UploadFloatingButton = observer(() => {
  const uploadStore = useUploadStore();

  if (!uploadStore.hasItems) return null;

  return (
    <FloatingButton
      icon="upload"
      percent={uploadStore.percent}
      completed={uploadStore.uploaded && uploadStore.errorsCount === 0}
      alert={uploadStore.errorsCount > 0}
      onClick={() => uploadStore.setPanelVisible(true)}
    />
  );
});;

// Bridge is mounted at the layout so the parent-driven `navigateSection`
// message is always handled regardless of the active sub-route, and so the
// `onNavigate` emit fires on every Next.js navigation without depending on
// per-page remounts. observer() so the agent-detail tab change inside
// aiRoomStore triggers the onNavigate emit.
const FrameBridgeHost = observer(() => {
  useAiAgentsFrameBridge(true);
  return null;
});

export default function AiAgentsRootLayout({ commonData, children }: Props) {
  return (
    <main style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <AiAgentsStoreProviders initialUser={commonData.user ?? null}>
        <DocspaceFilesLayout
          initSettingsStoreData={{ viewAs: commonData.initialViewAs }}
        >
          <AgentsCommonDataProvider
            value={{
              filesSettings: commonData.filesSettings ?? null,
              portalSettings: commonData.portalSettings ?? null,
            }}
          >
            <AiAgentsBootstrap commonData={commonData}>
              <SectionShell>{children}</SectionShell>
            </AiAgentsBootstrap>
          </AgentsCommonDataProvider>
        </DocspaceFilesLayout>
      </AiAgentsStoreProviders>
    </main>
  );
}
