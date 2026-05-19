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
import { useTranslation } from "react-i18next";

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import {
  QuickActions,
  type QuickActionItem,
} from "@docspace/ui-kit/components/quick-actions";
import { CreateAgentIcon } from "@docspace/ui-kit/components/quick-actions/icons";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

import {
  useAgentsListStore,
  useAgentDialogsStore,
  useAgentsAIConfigStore,
} from "../_store";
import useAiAgentsPageInit from "../_hooks/useAiAgentsPageInit";
import useAiAgentsFrameBridge from "../_hooks/useAiAgentsFrameBridge";

import AgentsList from "../_components/agents-list";
import AgentsFilter from "../_components/agents-filter";
import AgentsHeader from "../_components/agents-header";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";
import styles from "../_components/agents-list/AgentsList.module.scss";

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
};

const AgentsListPage = ({ initialSearch }: Props) => {
  const { t } = useTranslation(["Common"]);
  const store = useAgentsListStore();
  const dialogsStore = useAgentDialogsStore();
  const aiConfigStore = useAgentsAIConfigStore();

  useAiAgentsPageInit();
  useAiAgentsFrameBridge(true, null);

  const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();

  // Initial fetch — seeds the list using the default RoomsFilter; subsequent
  // changes are driven by AgentsFilter callbacks (which call store.fetchAgents).
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const filter = store.filter.clone();
    if (initialSearch) filter.filterValue = initialSearch;
    store.fetchAgents(filter);
    // Drive the EmptyView copy: pulls aiReady from /ai/config so the
    // "AI disabled" branch can fire when the portal has no provider.
    void aiConfigStore.fetchAIConfig();
  }, [initialSearch, store, aiConfigStore]);

  const onCreate = React.useCallback(() => {
    dialogsStore.setCreateAgentDialogVisible(true);
  }, [dialogsStore]);

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

  // AI Agents folder uses a plain primary action (no dropdown), matching
  // client `article/MainButton/index.js` ("isAIAgentsFolder" branch — a single
  // primary <Button> with label `Common:NewAgent`).
  const mainButtonProps = React.useMemo<MainButtonProps>(
    () => ({
      isDropdown: false,
      model: [],
      onAction: onCreate,
      text: t("Common:NewAgent", { defaultValue: "New agent" }),
    }),
    [t, onCreate],
  );

  return (
    <div className={styles.root} style={frameHeaderVars}>
      <div className={styles.scroll}>
        <div className={styles.headerWrap}>
          <AgentsHeader
            title={t("Common:AIAgents", { defaultValue: "AI Agents" })}
            isEmptyList={!store.isLoading && store.agents.length === 0}
            headerOffset={headerOffset}
          />
        </div>
        <QuickActions
          items={quickActionItems}
          className={styles.quickActions}
        />

        <AgentsFilter showMainButton mainButtonProps={mainButtonProps} />

        {store.isLoading ? (
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
          <AgentsList agents={store.agents} />
        )}
      </div>

      {dialogsStore.createAgentDialogVisible ? (
        <CreateAgentEvent
          visible={dialogsStore.createAgentDialogVisible}
          onClose={() => dialogsStore.setCreateAgentDialogVisible(false)}
        />
      ) : null}

      {dialogsStore.editAgentDialogVisible && dialogsStore.editingAgent ? (
        <EditAgentEvent
          visible={dialogsStore.editAgentDialogVisible}
          onClose={() => dialogsStore.setEditAgentDialogVisible(false, null)}
          item={dialogsStore.editingAgent}
        />
      ) : null}
    </div>
  );
};

export default observer(AgentsListPage);
