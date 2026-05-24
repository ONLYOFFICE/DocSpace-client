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
import { useTranslation } from "react-i18next";

import AIAgentSelector from "@docspace/ui-kit/selectors/AIAgent";
import FilesSelector from "@docspace/ui-kit/selectors/Files";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { toastr } from "@docspace/ui-kit/components/toast";
import useGetIcon from "@docspace/ui-kit/ai-agent/chat/hooks/useGetIcon";
import {
  FolderType,
  DeviceType,
  FilesSelectorFilterTypes,
} from "@docspace/shared/enums";
import { deleteAIAgent, getAIAgent } from "@docspace/shared/api/ai";
import { tearDownPanel, toAgentSummary } from "@/utils/ai-arbiter";
import { clearArbiterSession } from "../_utils/arbiterDb";

import { ARBITER_PANEL_ID } from "@/types/arbiter";

import { useAiArbiterAgentsStore } from "../_store/AiArbiterAgentsStore";
import { useAiArbiterRunStore } from "../_store/AiArbiterRunStore";
import useArbiterRun from "../_hooks/useArbiterRun";
import { useArbiterPersistence } from "../_hooks/useArbiterPersistence";
import { AgentList } from "../_components/AgentList";
import { IntroBackdrop } from "../_components/IntroBackdrop";
import { PanelView } from "../_components/PanelView";
import { ResetPanelDialog } from "../_components/ResetPanelDialog";
import { WizardOverlay } from "../_components/wizard/WizardOverlay";
import styles from "../_components/ArbiterApp.module.scss";

const AiArbiterPage = observer(() => {
  const { t } = useTranslation(["Common"]);
  const agentsStore = useAiArbiterAgentsStore();
  const runStore = useAiArbiterRunStore();
  const { run, stop } = useArbiterRun();
  useArbiterPersistence();

  const { experts, arbiter, sessionId, userId, canRun, hasPanel } = agentsStore;
  const { question, attachedFile, runStatus, expertPanels, arbiterPanel } =
    runStore;

  const isRunning = runStatus === "running";

  const { getIcon } = useGetIcon();

  const [wizardOpen, setWizardOpen] = React.useState(true);
  const [resetDialogVisible, setResetDialogVisible] = React.useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = React.useState(false);
  const [fileSelectorOpen, setFileSelectorOpen] = React.useState(false);

  React.useEffect(() => {
    if (!hasPanel) setWizardOpen(true);
  }, [hasPanel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canRun && !isRunning) run();
    }
  };

  const excludeItems = React.useMemo(
    () =>
      [...experts.map((e) => e.id), arbiter?.id].filter(
        (id): id is number => id !== undefined,
      ),
    [experts, arbiter],
  );

  const handleRemoveExpert = async (id: number) => {
    try {
      await deleteAIAgent(id);
    } catch {
      // ignore — agent may already be gone
    }
    agentsStore.removeExpert(id);
  };

  const handleAgentSelected = async (items: TSelectorItem[]) => {
    setAgentSelectorOpen(false);
    const item = items[0];
    if (!item) return;
    try {
      const agent = await getAIAgent(Number(item.id));
      agentsStore.addExpert(toAgentSummary(agent));
    } catch {
      // ignore
    }
  };

  const handleClearResults = () => {
    runStore.clearRun();
    if (sessionId) clearArbiterSession(sessionId).catch(() => {});
  };

  const handleFileSubmit: React.ComponentProps<
    typeof FilesSelector
  >["onSubmit"] = (
    _selectedItemId,
    _folderTitle,
    _isPublic,
    _breadCrumbs,
    _fileName,
    _isChecked,
    _selectedTreeNode,
    selectedFileInfo,
  ) => {
    if (selectedFileInfo) {
      runStore.setAttachedFile({
        id: Number(selectedFileInfo.id),
        name: selectedFileInfo.title,
      });
    }
    setFileSelectorOpen(false);
  };

  const getIsDisabledFile: React.ComponentProps<
    typeof FilesSelector
  >["getIsDisabled"] = (
    isFirstLoad,
    _isSelectedParentFolder,
    _selectedItemId,
    _selectedItemType,
    _isRoot,
    _selectedItemSecurity,
    selectedFileInfo,
  ) => isFirstLoad || !selectedFileInfo;

  const handleResetConfirm = async () => {
    if (!sessionId || !userId) return;
    await tearDownPanel(sessionId, userId);
    agentsStore.clearActivePanel();
    setResetDialogVisible(false);
    toastr.success(t("Common:ArbiterConfigurationReset"));
  };

  if (!hasPanel || !arbiter) {
    return (
      <div className={styles.layout}>
        <IntroBackdrop
          onStart={!wizardOpen ? () => setWizardOpen(true) : undefined}
        />
        <WizardOverlay
          visible={wizardOpen}
          onClose={() => setWizardOpen(false)}
        />
      </div>
    );
  }

  const hasPanels = expertPanels.length > 0 || !!arbiterPanel;

  type SdkFolderType = Parameters<typeof FilesSelector>[0]["rootFolderType"];
  const sdkUserFolderType = FolderType.USER as unknown as SdkFolderType;

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={styles.resetFab}
        onClick={() => setResetDialogVisible(true)}
        title="Reset AI Arbiter configuration"
      >
        Reset configuration
      </button>

      <div className={styles.pageHeader}>
        <p className={styles.pageTitle}>AI Arbiter</p>
        <p className={styles.pageDescription}>
          {t("Common:ArbiterPageDescription")}
        </p>
      </div>

      {/* Question input */}
      <div className={styles.inputArea}>
        <div className={styles.questionRow}>
          <textarea
            className={styles.textarea}
            value={question}
            onChange={(e) => runStore.setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Ctrl+Enter to run)"
            disabled={isRunning}
            rows={3}
          />
          {isRunning ? (
            <button className={styles.stopBtn} type="button" onClick={stop}>
              Stop
            </button>
          ) : (
            <button
              className={styles.runBtn}
              type="button"
              onClick={run}
              disabled={!canRun || !question.trim()}
            >
              Run
            </button>
          )}
        </div>

        <div className={styles.metaRow}>
          <button
            type="button"
            className={styles.attachFileBtn}
            disabled={isRunning}
            onClick={() => setFileSelectorOpen(true)}
          >
            Attach file
          </button>

          {attachedFile && (
            <span className={styles.fileChip}>
              {attachedFile.name}
              {!isRunning && (
                <button
                  className={styles.fileChipRemove}
                  type="button"
                  onClick={() => runStore.setAttachedFile(null)}
                  aria-label="Remove file"
                >
                  x
                </button>
              )}
            </span>
          )}

          <div className={styles.metaRight}>
            {!isRunning && (hasPanels || !!question || !!attachedFile) && (
              <button
                type="button"
                className={styles.clearResultsBtn}
                onClick={handleClearResults}
              >
                Clear
              </button>
            )}
            {runStatus !== "idle" && (
              <span className={styles.statusText}>
                {runStatus === "running" && "Running..."}
                {runStatus === "done" && "Done"}
                {runStatus === "error" && "Error"}
                {runStatus === "aborted" && "Stopped"}
              </span>
            )}
          </div>
        </div>
      </div>

      <AgentList
        experts={experts}
        arbiter={arbiter}
        isRunning={isRunning}
        onRemoveExpert={handleRemoveExpert}
        onAddExpert={() => setAgentSelectorOpen(true)}
      />

      {agentSelectorOpen && (
        <AIAgentSelector
          excludeItems={excludeItems}
          onSubmit={handleAgentSelected}
          onClose={() => setAgentSelectorOpen(false)}
        />
      )}

      {/* Panels */}
      <div className={styles.panelsArea}>
        {!hasPanels && !isRunning && (
          <p className={styles.emptyHint}>
            Enter a question above and click Run.
          </p>
        )}

        {expertPanels.length > 0 && (
          <>
            <p className={styles.arbiterSectionTitle}>Expert panels</p>
            <div className={styles.expertsGrid}>
              {expertPanels.map((panel) => (
                <PanelView
                  key={panel.panelId}
                  panel={panel}
                  isCollapsed={runStore.collapsedPanels.has(panel.panelId)}
                  onToggleCollapse={() =>
                    runStore.toggleCollapsed(panel.panelId)
                  }
                />
              ))}
            </div>
          </>
        )}

        {arbiterPanel && (
          <>
            <p className={styles.arbiterSectionTitle}>Arbiter</p>
            <PanelView panel={arbiterPanel} isArbiter key={ARBITER_PANEL_ID} />
          </>
        )}
      </div>

      <ResetPanelDialog
        visible={resetDialogVisible}
        expertCount={experts.length}
        onCancel={() => setResetDialogVisible(false)}
        onConfirm={handleResetConfirm}
      />

      <FilesSelector
        isPanelVisible={fileSelectorOpen}
        onCancel={() => setFileSelectorOpen(false)}
        onSubmit={handleFileSubmit}
        getIcon={getIcon}
        getIsDisabled={getIsDisabledFile}
        openRoot
        currentFolderId=""
        rootFolderType={sdkUserFolderType}
        disabledItems={[]}
        isRoomsOnly={false}
        isThirdParty={false}
        withSearch
        withBreadCrumbs
        withoutBackButton
        withCancelButton
        withCreate={false}
        withFooterInput={false}
        withFooterCheckbox={false}
        submitButtonLabel={t("Common:SelectAction")}
        cancelButtonLabel={t("Common:CancelButton")}
        footerCheckboxLabel=""
        footerInputHeader=""
        currentFooterInputValue=""
        descriptionText=""
        getFilesArchiveError={() => ""}
        currentDeviceType={DeviceType.desktop}
        filterParam={FilesSelectorFilterTypes.ALL}
      />
    </div>
  );
});

export default AiArbiterPage;

