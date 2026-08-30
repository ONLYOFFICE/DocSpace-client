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

import MarkdownField from "@docspace/ui-kit/ai-agent/markdown";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import ZoomPlusIcon from "@docspace/ui-kit/assets/zoom-plus.react.svg";

import type { PanelState } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";

type PanelViewProps = {
  panel: PanelState;
  isArbiter?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const STATUS_COLOR: Partial<Record<PanelState["status"], string>> = {
  streaming: "var(--arbiter-accent)",
  done: "var(--arbiter-status-positive)",
  error: "var(--arbiter-status-negative)",
  aborted: "var(--arbiter-muted)",
};

export const PanelView = observer(
  ({
    panel,
    isArbiter = false,
    isCollapsed = false,
    onToggleCollapse,
  }: PanelViewProps) => {
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
    const collapsible = !isArbiter && !!onToggleCollapse;

    const displayText =
      status === "done" || status === "aborted" || status === "error"
        ? panel.finalText || panel.streamingText
        : panel.streamingText;

    const [showReasoning, setShowReasoning] = React.useState(false);
    const [fullscreen, setFullscreen] = React.useState(false);

    const renderBody = () => {
      if (status === "error") {
        return (
          <Text fontSize="13px" color="var(--arbiter-status-negative)">
            {panel.error}
          </Text>
        );
      }
      if (!displayText) {
        return (
          <Text fontSize="13px" color="var(--arbiter-muted)">
            {status === "idle" ? t("Common:ArbiterWaiting") : ""}
          </Text>
        );
      }
      return (
        <>
          <MarkdownField chatMessage={displayText} />
          {panel.reasoningText ? (
            <div className={styles.reasoningSection}>
              <Link
                type={LinkType.action}
                fontSize="12px"
                isHovered
                onClick={() => setShowReasoning((s) => !s)}
              >
                {showReasoning
                  ? t("Common:ArbiterHideReasoning")
                  : t("Common:ArbiterShowReasoning")}
              </Link>
              {showReasoning ? (
                <MarkdownField chatMessage={panel.reasoningText} />
              ) : null}
            </div>
          ) : null}
        </>
      );
    };

    const renderTitle = (titleSize: string, modelSize: string) => (
      <>
        <Text
          className={styles.panelTitle}
          fontSize={titleSize}
          fontWeight={600}
          truncate
          title={panel.alias}
        >
          {panel.alias}
        </Text>
        {panel.modelAlias ? (
          <Text fontSize={modelSize} color="var(--arbiter-muted)" noSelect>
            {panel.modelAlias}
          </Text>
        ) : null}
      </>
    );

    return (
      <>
        <div
          className={isArbiter ? styles.panelArbiter : styles.panel}
          data-status={status}
        >
          <div
            className={
              collapsible ? styles.panelHeaderClickable : styles.panelHeader
            }
            onClick={collapsible ? onToggleCollapse : undefined}
            role={collapsible ? "button" : undefined}
            tabIndex={collapsible ? 0 : undefined}
            onKeyDown={
              collapsible
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") onToggleCollapse?.();
                  }
                : undefined
            }
          >
            {renderTitle("13px", "11px")}

            {label ? (
              <Text
                className={styles.panelStatus}
                fontSize="11px"
                fontWeight={600}
                color={STATUS_COLOR[status]}
                noSelect
              >
                {status === "streaming" ? (
                  <span className={styles.spinnerDot} aria-hidden="true" />
                ) : null}
                {label}
              </Text>
            ) : null}

            <IconButton
              iconNode={<ZoomPlusIcon />}
              size={16}
              isClickable
              isFill
              title={t("Common:ArbiterExpandPanel")}
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(true);
              }}
            />
          </div>

          {!isCollapsed || isArbiter ? (
            <div
              className={isArbiter ? styles.panelBodyArbiter : styles.panelBody}
            >
              {renderBody()}
            </div>
          ) : null}
        </div>

        {fullscreen ? (
          <ModalDialog
            visible
            displayType={ModalDialogType.aside}
            withBodyScroll
            onClose={() => setFullscreen(false)}
          >
            <ModalDialog.Header>
              <div className={styles.fullscreenTitle}>
                {renderTitle("16px", "13px")}
              </div>
            </ModalDialog.Header>
            <ModalDialog.Body>
              <div className={styles.fullscreenBody}>{renderBody()}</div>
            </ModalDialog.Body>
          </ModalDialog>
        ) : null}
      </>
    );
  },
);
