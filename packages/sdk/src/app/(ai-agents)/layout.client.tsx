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
} from "./_store";
import DeleteAgentDialog from "./_components/delete-agent-dialog";
import LeaveAgentDialog from "./_components/leave-agent-dialog";
import {
  AgentInfoPanelBody,
  AgentInfoPanelHeader,
} from "./_components/info-panel";

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
  header: React.ReactNode;
  filter: React.ReactNode;
  submenu: React.ReactNode;
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
    header,
    filter,
    submenu,
  }: {
    children: React.ReactNode;
    header: React.ReactNode;
    filter: React.ReactNode;
    submenu: React.ReactNode;
  }) => {
    const { currentDeviceType } = useDeviceType();
    const { frameHeaderVars } = useFrameHeaderConfig();
    const infoPanel = useAgentInfoPanelStore();
    const pathname = usePathname() ?? "";

    const isInfoVisible = infoPanel.isVisible && !!infoPanel.currentAgent;

    // The agent detail page hosts the chat (or a result file viewer), which
    // owns its scroll and must fill the section height. Mirrors client
    // Home/index.js — toggle `fullHeightBody` + `withoutFooter`, leave
    // `withBodyScroll` at its default.
    const isAgentDetail = /\/ai-agents\/(?!settings(?:$|\/)|recent$|favorites$|trash$)[^/]+$/.test(
      pathname,
    );

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
          fullHeightBody={isAgentDetail}
          withoutFooter={isAgentDetail}
          uploadFiles={false}
          settingsStudio={false}
        >
          <Section.SectionHeader>{header}</Section.SectionHeader>
          <Section.SectionFilter>{filter}</Section.SectionFilter>
          <Section.SectionSubmenu>{submenu}</Section.SectionSubmenu>
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

  // Mirror client Shell.jsx — subscribe to `change-ai-config` and refetch
  // /ai/config when a provider is added/removed elsewhere.
  React.useEffect(() => {
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
    </QueryClientProvider>
  );
};

export default function AiAgentsRootLayout({
  commonData,
  children,
  header,
  filter,
  submenu,
}: Props) {
  return (
    <main style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <AiAgentsStoreProviders initialUser={commonData.user ?? null}>
        <DocspaceFilesLayout
          initSettingsStoreData={{ viewAs: commonData.initialViewAs }}
        >
          <AiAgentsBootstrap commonData={commonData}>
            <SectionShell header={header} filter={filter} submenu={submenu}>
              {children}
            </SectionShell>
          </AiAgentsBootstrap>
        </DocspaceFilesLayout>
      </AiAgentsStoreProviders>
    </main>
  );
}
