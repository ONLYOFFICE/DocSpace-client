/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

"use client";

import React from "react";
import { observer } from "mobx-react";

import { ARBITER_PANEL_ID } from "@/types/arbiter";

import { useAiArbiterAgentsStore } from "../_store/AiArbiterAgentsStore";
import { useAiArbiterRunStore } from "../_store/AiArbiterRunStore";
import useArbiterRun from "../_hooks/useArbiterRun";
import { AgentPicker } from "../_components/AgentPicker";
import { PanelView } from "../_components/PanelView";
import { FilePicker } from "../_components/FilePicker";
import styles from "../_components/ArbiterApp.module.scss";

const AiArbiterPage = observer(() => {
  const agentsStore = useAiArbiterAgentsStore();
  const runStore = useAiArbiterRunStore();
  const { run, stop } = useArbiterRun();

  const { agents, expertIds, arbiterId, canRun } = agentsStore;
  const { question, attachedFile, runStatus, expertPanels, arbiterPanel } =
    runStore;

  const isRunning = runStatus === "running";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canRun && !isRunning) run();
    }
  };

  const hasPanels = expertPanels.length > 0 || !!arbiterPanel;

  return (
    <div className={styles.layout}>
      {/* Question input */}
      <div className={styles.inputArea}>
        <div className={styles.questionRow}>
          <textarea
            className={styles.textarea}
            value={question}
            onChange={(e) => runStore.setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Ctrl+Enter to run)"
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
          <FilePicker
            disabled={isRunning}
            onSelect={(file) => runStore.setAttachedFile(file)}
          />

          {attachedFile && (
            <span className={styles.fileChip}>
              📎 {attachedFile.name}
              {!isRunning && (
                <button
                  className={styles.fileChipRemove}
                  type="button"
                  onClick={() => runStore.setAttachedFile(null)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              )}
            </span>
          )}

          {runStatus !== "idle" && (
            <span className={styles.statusText}>
              {runStatus === "running" && "Running…"}
              {runStatus === "done" && "Done"}
              {runStatus === "error" && "Error"}
              {runStatus === "aborted" && "Stopped"}
            </span>
          )}
        </div>
      </div>

      {/* Agent picker */}
      <AgentPicker
        agents={agents}
        expertIds={expertIds}
        arbiterId={arbiterId}
        isRunning={isRunning}
        isUnavailable={agentsStore.isAgentUnavailable}
        onAddExpert={agentsStore.addExpert}
        onRemoveExpert={agentsStore.removeExpert}
        onSetArbiter={agentsStore.setArbiterId}
      />

      {/* Panels */}
      <div className={styles.panelsArea}>
        {!hasPanels && !isRunning && (
          <p className={styles.emptyHint}>
            Pick at least one expert and one arbiter above, enter a question,
            then click Run.
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
            <PanelView
              panel={arbiterPanel}
              isArbiter
              key={ARBITER_PANEL_ID}
            />
          </>
        )}
      </div>
    </div>
  );
});

export default AiArbiterPage;
