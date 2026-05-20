/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

"use client";

import React from "react";
import { observer } from "mobx-react";

import type { PanelState } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";

const STATUS_LABELS: Record<PanelState["status"], string> = {
  idle: "",
  streaming: "Running…",
  done: "Done",
  error: "Error",
  aborted: "Stopped",
};

type PanelViewProps = {
  panel: PanelState;
  isArbiter?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export const PanelView = observer(
  ({ panel, isArbiter = false, isCollapsed = false, onToggleCollapse }: PanelViewProps) => {
    const { status } = panel;
    const label = STATUS_LABELS[status];
    const headerClass = isArbiter ? styles.panelHeaderArbiter : styles.panelHeader;
    const bodyClass = isArbiter ? styles.panelBodyArbiter : styles.panelBody;

    const displayText = status === "done" || status === "aborted" || status === "error"
      ? panel.finalText || panel.streamingText
      : panel.streamingText;

    const [showReasoning, setShowReasoning] = React.useState(false);

    return (
      <div className={styles.panel} data-status={status}>
        <div
          className={headerClass}
          onClick={!isArbiter ? onToggleCollapse : undefined}
          role={!isArbiter ? "button" : undefined}
          tabIndex={!isArbiter ? 0 : undefined}
          onKeyDown={!isArbiter
            ? (e) => { if (e.key === "Enter" || e.key === " ") onToggleCollapse?.(); }
            : undefined
          }
        >
          <span className={styles.panelTitle}>{panel.alias}</span>
          <span className={styles.panelModel}>{panel.modelAlias}</span>

          {label && (
            <span className={styles.panelBadge} data-status={status}>
              {status === "streaming" && (
                <span className={styles.spinnerDot} style={{ marginRight: 4 }} />
              )}
              {label}
            </span>
          )}

          {!isArbiter && (
            <span
              className={styles.panelChevron}
              data-collapsed={isCollapsed ? "true" : "false"}
              aria-hidden="true"
            >
              ▾
            </span>
          )}
        </div>

        {(!isCollapsed || isArbiter) && (
          <div className={bodyClass}>
            {status === "error" ? (
              <div className={styles.errorBox}>{panel.error}</div>
            ) : displayText ? (
              <>
                <pre className={styles.streamingText}>{displayText}</pre>
                {panel.reasoningText && (
                  <div className={styles.reasoningSection}>
                    <button
                      className={styles.reasoningToggle}
                      type="button"
                      onClick={() => setShowReasoning((s) => !s)}
                    >
                      {showReasoning ? "▾ Hide reasoning" : "▸ Show reasoning"}
                    </button>
                    {showReasoning && (
                      <pre className={styles.reasoningText}>
                        {panel.reasoningText}
                      </pre>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className={styles.placeholderText}>
                {status === "idle" ? "Waiting…" : ""}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
