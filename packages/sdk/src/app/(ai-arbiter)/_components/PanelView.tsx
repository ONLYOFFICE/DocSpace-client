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
import ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import MarkdownField from "@docspace/ui-kit/ai-agent/chat/components/chat-message-body/sub-components/message/Markdown";

import type { PanelState } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";


type PanelViewProps = {
  panel: PanelState;
  isArbiter?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export const PanelView = observer(
  ({ panel, isArbiter = false, isCollapsed = false, onToggleCollapse }: PanelViewProps) => {
    const { t } = useTranslation(["Common"]);
    const { status } = panel;
    const statusLabels: Record<PanelState["status"], string> = {
      idle: "",
      streaming: t("Common:ArbiterRunning"),
      done: t("Common:Done"),
      error: t("Common:Error"),
      aborted: t("Common:ArbiterStopped"),
    };
    const label = statusLabels[status];
    const headerClass = isArbiter ? styles.panelHeaderArbiter : styles.panelHeader;
    const bodyClass = isArbiter ? styles.panelBodyArbiter : styles.panelBody;

    const displayText = status === "done" || status === "aborted" || status === "error"
      ? panel.finalText || panel.streamingText
      : panel.streamingText;

    const [showReasoning, setShowReasoning] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);

    const renderBody = () => (
      <>
        {status === "error" ? (
          <div className={styles.errorBox}>{panel.error}</div>
        ) : displayText ? (
          <>
            <MarkdownField chatMessage={displayText} />
            {panel.reasoningText && (
              <div className={styles.reasoningSection}>
                <button
                  className={styles.reasoningToggle}
                  type="button"
                  onClick={() => setShowReasoning((s) => !s)}
                >
                  {showReasoning ? t("Common:ArbiterHideReasoning") : t("Common:ArbiterShowReasoning")}
                </button>
                {showReasoning && (
                  <MarkdownField chatMessage={panel.reasoningText} />
                )}
              </div>
            )}
          </>
        ) : (
          <p className={styles.placeholderText}>
            {status === "idle" ? t("Common:ArbiterWaiting") : ""}
          </p>
        )}
      </>
    );

    return (
      <>
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

            <button
              type="button"
              className={styles.expandBtn}
              aria-label={t("Common:ArbiterExpandPanel")}
              title={t("Common:ArbiterExpandPanel")}
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="7.5,1 11,1 11,4.5" />
                <line x1="6.5" y1="5.5" x2="11" y2="1" />
                <polyline points="4.5,11 1,11 1,7.5" />
                <line x1="5.5" y1="6.5" x2="1" y2="11" />
              </svg>
            </button>

            {!isArbiter && (
              <span
                className={styles.panelChevron}
                data-collapsed={isCollapsed ? "true" : "false"}
                aria-hidden="true"
              >
                v
              </span>
            )}
          </div>

          {(!isCollapsed || isArbiter) && (
            <div className={bodyClass}>{renderBody()}</div>
          )}
        </div>

        {modalOpen && ReactDOM.createPortal(
          <div className={styles.fullscreenOverlay}>
            <div className={styles.fullscreenHeader}>
              <span className={styles.panelTitle}>{panel.alias}</span>
              <span className={styles.panelModel}>{panel.modelAlias}</span>
              <button
                type="button"
                className={styles.fullscreenClose}
                aria-label={t("Common:CloseButton")}
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.fullscreenBody}>{renderBody()}</div>
          </div>,
          document.body,
        )}
      </>
    );
  },
);
