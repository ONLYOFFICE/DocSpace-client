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

import { useEffect, useRef } from "react";
import { reaction, toJS } from "mobx";

import { useAiArbiterAgentsStore } from "../_store/AiArbiterAgentsStore";
import { useAiArbiterRunStore } from "../_store/AiArbiterRunStore";
import {
  clearArbiterSession,
  loadArbiterSession,
  saveArbiterSession,
  type PersistedSession,
} from "../_utils/arbiterDb";

export function useArbiterPersistence(): void {
  const agentsStore = useAiArbiterAgentsStore();
  const runStore = useAiArbiterRunStore();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const disposeLoad = reaction(
      () => agentsStore.sessionId,
      (sessionId) => {
        if (!sessionId || prevSessionIdRef.current === sessionId) return;
        if (prevSessionIdRef.current !== null) runStore.clearRun();
        prevSessionIdRef.current = sessionId;

        loadArbiterSession(sessionId)
          .then((saved) => {
            if (!saved) return;
            if (saved.question) runStore.setQuestion(saved.question);
            if (saved.attachedFile) runStore.setAttachedFile(saved.attachedFile);
            if (saved.panels.length > 0) {
              runStore.restoreSession(
                saved.panels,
                saved.collapsedPanels,
                saved.runStatus,
              );
            }
            if (saved.experts && saved.experts.length > 0) {
              agentsStore.setExperts(saved.experts);
            }
          })
          .catch((err) => {
            console.warn("[ai-arbiter] restore failed:", err);
          });
      },
      { fireImmediately: true },
    );

    return () => disposeLoad();
  }, [agentsStore, runStore]);

  useEffect(() => {
    const schedSave = (data: PersistedSession) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveArbiterSession(data).catch((err) => {
          console.warn("[ai-arbiter] save failed:", err);
        });
      }, 500);
    };

    const dispose = reaction(
      () => {
        const sessionId = agentsStore.sessionId;
        const runStatus = runStore.runStatus;
        const isRunning = runStatus === "running";
        return {
          sessionId,
          question: runStore.question,
          attachedFile: runStore.attachedFile
            ? toJS(runStore.attachedFile)
            : null,
          runStatus,
          collapsedPanels: Array.from(runStore.collapsedPanels),
          experts: agentsStore.experts.map((e) => toJS(e)),
          panels: !isRunning
            ? Array.from(runStore.panels.entries()).map(
                ([id, p]) => [id, toJS(p)] as [string, typeof p],
              )
            : null,
        };
      },
      (data) => {
        if (!data.sessionId) {
          if (prevSessionIdRef.current) {
            clearArbiterSession(prevSessionIdRef.current).catch(() => {});
            prevSessionIdRef.current = null;
          }
          if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
          }
          return;
        }

        if (data.runStatus === "running") return;

        schedSave({
          sessionId: data.sessionId,
          question: data.question,
          attachedFile: data.attachedFile,
          runStatus: data.runStatus,
          panels: data.panels ?? [],
          collapsedPanels: data.collapsedPanels,
          experts: data.experts,
          savedAt: Date.now(),
        });
      },
    );

    return () => {
      dispose();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [agentsStore, runStore]);
}
