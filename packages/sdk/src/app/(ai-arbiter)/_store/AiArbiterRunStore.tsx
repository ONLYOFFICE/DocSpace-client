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
import { makeAutoObservable, observable, action, computed } from "mobx";

import {
  ARBITER_PANEL_ID,
  ARBITER_PENDING_FILE_KEY,
  type PanelState,
  type AttachedFile,
  type SseEvent,
  type AgentSummary,
} from "@/types/arbiter";

export type RunStatus = "idle" | "running" | "done" | "error" | "aborted";

class AiArbiterRunStore {
  panels = observable.map<string, PanelState>();
  question = "";
  attachedFile: AttachedFile | null = null;
  runStatus: RunStatus = "idle";
  collapsedPanels = observable.set<string>();

  constructor() {
    makeAutoObservable(this, {
      expertPanels: computed,
      arbiterPanel: computed,
    });
    this.consumePendingAttachedFile();
  }

  setQuestion = action((q: string) => {
    this.question = q;
  });

  setAttachedFile = action((file: AttachedFile | null) => {
    this.attachedFile = file;
  });

  consumePendingAttachedFile = action(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(ARBITER_PENDING_FILE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(ARBITER_PENDING_FILE_KEY);
      const parsed = JSON.parse(raw) as { id?: unknown; name?: unknown };
      if (
        typeof parsed.id === "number" &&
        typeof parsed.name === "string"
      ) {
        this.attachedFile = { id: parsed.id, name: parsed.name };
      }
    } catch {
      // ignore
    }
  });

  initPanels = action(
    (experts: AgentSummary[], arbiter: AgentSummary) => {
      this.panels.clear();
      this.collapsedPanels.clear();

      experts.forEach((e, i) => {
        const panelId = `expert-${i}`;
        this.panels.set(panelId, {
          panelId,
          agentId: e.id,
          alias: e.title,
          modelAlias: e.modelAlias,
          status: "idle",
          streamingText: "",
          reasoningText: "",
          finalText: "",
          toolCalls: [],
        });
      });

      this.panels.set(ARBITER_PANEL_ID, {
        panelId: ARBITER_PANEL_ID,
        agentId: arbiter.id,
        alias: arbiter.title,
        modelAlias: arbiter.modelAlias,
        status: "idle",
        streamingText: "",
        reasoningText: "",
        finalText: "",
        toolCalls: [],
      });
    },
  );

  applyEvent = action((panelId: string, ev: SseEvent) => {
    const p = this.panels.get(panelId);
    if (!p) return;

    switch (ev.type) {
      case "message_start":
        p.chatId = ev.chatId;
        p.status = "streaming";
        break;
      case "new_token":
        p.streamingText += ev.text;
        break;
      case "reasoning":
        p.reasoningText += ev.text;
        break;
      case "tool_call":
        p.toolCalls.push({ name: ev.name, callId: ev.callId });
        break;
      case "message_stop":
        p.finalText = p.streamingText;
        p.status = "done";
        break;
      case "error":
        p.error = ev.message;
        p.status = "error";
        break;
      default:
        break;
    }
  });

  setRunStatus = action((s: RunStatus) => {
    this.runStatus = s;
  });

  abortAll = action(() => {
    this.panels.forEach((p) => {
      if (p.status === "streaming" || p.status === "idle") {
        p.status = "aborted";
      }
    });
    this.runStatus = "aborted";
  });

  toggleCollapsed = action((panelId: string) => {
    if (this.collapsedPanels.has(panelId)) {
      this.collapsedPanels.delete(panelId);
    } else {
      this.collapsedPanels.add(panelId);
    }
  });

  get expertPanels(): PanelState[] {
    return Array.from(this.panels.values()).filter(
      (p) => p.panelId !== ARBITER_PANEL_ID,
    );
  }

  get arbiterPanel(): PanelState | undefined {
    return this.panels.get(ARBITER_PANEL_ID);
  }
}

export const AiArbiterRunStoreContext =
  React.createContext<AiArbiterRunStore | null>(null);

export const AiArbiterRunStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AiArbiterRunStore(), []);
  return (
    <AiArbiterRunStoreContext.Provider value={store}>
      {children}
    </AiArbiterRunStoreContext.Provider>
  );
};

export const useAiArbiterRunStore = (): AiArbiterRunStore => {
  const store = React.useContext(AiArbiterRunStoreContext);
  if (!store)
    throw new Error(
      "useAiArbiterRunStore must be used within AiArbiterRunStoreContextProvider",
    );
  return store;
};
