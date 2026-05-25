// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  QuickActions,
  type QuickActionItem,
} from "@docspace/ui-kit/components/quick-actions";
import { CreateAgentIcon } from "@docspace/ui-kit/components/quick-actions/icons";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

import AgentsFilter from "../../_components/agents-filter";
import {
  useAgentDialogsStore,
  useAgentsAIConfigStore,
  useAgentsUserStore,
} from "../../_store";
import styles from "../../_components/agents-list/AgentsList.module.scss";

export default observer(function ListFilter() {
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
  const canManage = !!(
    user?.isAdmin ||
    user?.isOwner ||
    user?.isRoomAdmin
  );
  const showCreateButton = canManage;
  const aiReady = aiConfigStore.aiReady;

  if (!aiReady) return null;

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
