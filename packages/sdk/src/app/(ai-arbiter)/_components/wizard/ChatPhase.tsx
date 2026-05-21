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

import React from "react";

import { parseChips } from "@/utils/ai-arbiter";

import styles from "./Wizard.module.scss";
import type { ChatMessage } from "./useWizardChat";

function inferPreparingStage(text: string): string {
  if (!text) return "Analyzing your answers…";
  const roleMatches = text.match(/"role_title"\s*:/g);
  const roleCount = roleMatches ? roleMatches.length : 0;
  if (text.includes('"arbiter"')) {
    if (text.trimEnd().endsWith("}")) return "Finalizing your panel…";
    return "Composing the arbiter…";
  }
  if (roleCount > 0) return `Designing expert ${roleCount}…`;
  return "Analyzing your answers…";
}

function PreparingProgress({ text }: { text: string }) {
  return (
    <div className={styles.preparing}>
      <div className={styles.preparingHeader}>
        <span className={styles.preparingTitle}>Designing your AI experts</span>
        <span className={styles.preparingStage}>
          {inferPreparingStage(text)}
        </span>
      </div>
      <div className={styles.preparingBar} aria-hidden="true">
        <div className={styles.preparingBarFill} />
      </div>
    </div>
  );
}

type ChatPhaseProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatPhase({
  messages,
  isStreaming,
  onSend,
  onStop,
}: ChatPhaseProps) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const visible = React.useMemo(
    () =>
      messages
        .filter((m) => !m.hidden)
        .map((m) => {
          if (m.role !== "wizard") {
            return { ...m, options: [] as string[] };
          }
          const { displayText, options } = parseChips(m.text);
          return { ...m, text: displayText, options };
        }),
    [messages],
  );

  const lastText = visible[visible.length - 1]?.text;
  const lastMsg = visible[visible.length - 1];
  const showChips =
    !!lastMsg &&
    lastMsg.role === "wizard" &&
    lastMsg.status === "done" &&
    lastMsg.options.length > 0 &&
    !isStreaming;

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length, lastText]);

  const submit = () => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setDraft("");
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.chatLayout}>
      <div className={styles.messagesScroll} ref={scrollRef}>
        {visible.length === 0 ? (
          <div className={styles.chatPlaceholder}>Starting setup…</div>
        ) : (
          visible.map((m) => {
            if (m.role === "wizard" && m.pendingConfig) {
              return <PreparingProgress key={m.id} text={m.text} />;
            }
            return (
              <div
                key={m.id}
                className={
                  m.role === "user" ? styles.bubbleUser : styles.bubbleWizard
                }
                data-status={m.status}
              >
                <div className={styles.bubbleText}>
                  {m.text}
                  {m.status === "streaming" ? (
                    <span className={styles.caret} aria-hidden="true" />
                  ) : null}
                </div>
                {m.status === "error" && m.error ? (
                  <div className={styles.bubbleError}>{m.error}</div>
                ) : null}
              </div>
            );
          })
        )}

        {showChips ? (
          <div className={styles.chipsRow}>
            {lastMsg.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={styles.chip}
                onClick={() => onSend(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.chatInputRow}>
        <textarea
          className={styles.chatInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply…"
          disabled={isStreaming}
          rows={3}
        />
        {isStreaming ? (
          <button
            type="button"
            className={styles.chatStopBtn}
            onClick={onStop}
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            className={styles.chatSendBtn}
            onClick={submit}
            disabled={!draft.trim()}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
