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
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  Heading,
  HeadingLevel,
  HeadingSize,
} from "@docspace/ui-kit/components/heading";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { Tag } from "@docspace/ui-kit/components/tag";
import { Text } from "@docspace/ui-kit/components/text";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { toastr } from "@docspace/ui-kit/components/toast";
import useGetIcon from "@docspace/ui-kit/ai-agent/hooks/useGetIcon";
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
    runStore.clearRun();
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
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Heading level={HeadingLevel.h1} size={HeadingSize.small}>
            {t("Common:ArbiterTitle")}
          </Heading>
          <Text fontSize="12px" lineHeight="16px" color="var(--arbiter-muted)">
            {t("Common:ArbiterPageDescription")}
          </Text>
        </div>
        <div className={styles.pageHeaderActions}>
          <Button
            size={ButtonSize.small}
            label={t("Common:ArbiterResetConfiguration")}
            title={t("Common:ArbiterResetConfigurationTitle")}
            isDisabled={isRunning}
            onClick={() => setResetDialogVisible(true)}
          />
        </div>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.questionRow}>
          <Textarea
            wrapperClassName={styles.questionField}
            value={question}
            onChange={(e) => runStore.setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("Common:ArbiterQuestionPlaceholder")}
            isDisabled={isRunning}
            heightTextArea={72}
            fontSize={13}
          />
          <div className={styles.runButton}>
            {isRunning ? (
              <Button
                size={ButtonSize.normal}
                label={t("Common:ArbiterStop")}
                onClick={() => stop()}
              />
            ) : (
              <Button
                primary
                size={ButtonSize.normal}
                label={t("Common:ArbiterRun")}
                isDisabled={!canRun || !question.trim()}
                onClick={() => run()}
              />
            )}
          </div>
        </div>

        <div className={styles.metaRow}>
          {!isRunning ? (
            <Link
              type={LinkType.action}
              fontSize="12px"
              isHovered
              onClick={() => setFileSelectorOpen(true)}
            >
              {t("Common:ArbiterAttachFile")}
            </Link>
          ) : null}

          {attachedFile ? (
            <Tag
              tag={String(attachedFile.id)}
              label={attachedFile.name}
              isNewTag={!isRunning}
              onDelete={() => runStore.setAttachedFile(null)}
              tagMaxWidth="320px"
            />
          ) : null}

          <div className={styles.metaRight}>
            {!isRunning && (hasPanels || !!question || !!attachedFile) ? (
              <Link
                type={LinkType.action}
                fontSize="12px"
                isHovered
                onClick={handleClearResults}
              >
                {t("Common:ArbiterClear")}
              </Link>
            ) : null}
            {runStatus !== "idle" ? (
              <Text fontSize="12px" color="var(--arbiter-muted)" noSelect>
                {runStatus === "running" && t("Common:ArbiterRunning")}
                {runStatus === "done" && t("Common:Done")}
                {runStatus === "error" && t("Common:Error")}
                {runStatus === "aborted" && t("Common:ArbiterStopped")}
              </Text>
            ) : null}
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

      <div className={styles.panelsArea}>
        {!hasPanels && !isRunning && (
          <Text
            className={styles.emptyHint}
            fontSize="14px"
            textAlign="center"
            color="var(--arbiter-muted)"
          >
            {t("Common:ArbiterEmptyHint")}
          </Text>
        )}

        {expertPanels.length > 0 && (
          <div className={styles.expertSection}>
            <Text
              className={styles.sectionTitle}
              fontSize="12px"
              fontWeight={600}
              color="var(--arbiter-muted)"
              noSelect
            >
              {t("Common:ArbiterExpertPanels")}
            </Text>
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
          </div>
        )}

        {arbiterPanel && (
          <div className={styles.arbiterSection}>
            <Text
              className={styles.sectionTitle}
              fontSize="12px"
              fontWeight={600}
              color="var(--arbiter-muted)"
              noSelect
            >
              {t("Common:ArbiterSectionTitle")}
            </Text>
            <PanelView panel={arbiterPanel} isArbiter key={ARBITER_PANEL_ID} />
          </div>
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

