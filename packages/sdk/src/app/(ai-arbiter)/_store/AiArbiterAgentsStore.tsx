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
import { makeAutoObservable, computed } from "mobx";

import {
  MAX_EXPERTS,
  ARBITER_SELECTION_KEY,
  type AgentSummary,
} from "@/types/arbiter";

class AiArbiterAgentsStore {
  agents: AgentSummary[] = [];
  expertIds: number[] = [];
  arbiterId: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      expertAgents: computed,
      arbiterAgent: computed,
      canRun: computed,
    });
    this.loadPersistedSelection();
  }

  setAgents = (agents: AgentSummary[]) => {
    this.agents = agents;
  };

  addExpert = (id: number) => {
    if (this.expertIds.includes(id) || this.expertIds.length >= MAX_EXPERTS)
      return;
    if (id === this.arbiterId) return;
    this.expertIds = [...this.expertIds, id];
    this.persistSelection();
  };

  removeExpert = (id: number) => {
    this.expertIds = this.expertIds.filter((e) => e !== id);
    this.persistSelection();
  };

  setArbiterId = (id: number | null) => {
    this.arbiterId = id;
    if (id !== null) {
      this.expertIds = this.expertIds.filter((e) => e !== id);
    }
    this.persistSelection();
  };

  get expertAgents(): AgentSummary[] {
    return this.expertIds
      .map((id) => this.agents.find((a) => a.id === id))
      .filter((a): a is AgentSummary => a !== undefined);
  }

  get arbiterAgent(): AgentSummary | undefined {
    return this.arbiterId != null
      ? this.agents.find((a) => a.id === this.arbiterId)
      : undefined;
  }

  get canRun(): boolean {
    return this.expertIds.length > 0 && this.arbiterId !== null;
  }

  isAgentUnavailable = (agent: AgentSummary): boolean => {
    return !agent.modelId || !agent.modelAlias;
  };

  private loadPersistedSelection = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ARBITER_SELECTION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        expertIds?: unknown;
        arbiterId?: unknown;
      };
      const expertIds = Array.isArray(parsed.expertIds)
        ? parsed.expertIds.filter((x): x is number => typeof x === "number")
        : [];
      const arbiterId =
        typeof parsed.arbiterId === "number" ? parsed.arbiterId : null;
      this.expertIds = expertIds.slice(0, MAX_EXPERTS);
      this.arbiterId = arbiterId;
    } catch {
      // ignore parse errors
    }
  };

  private persistSelection = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        ARBITER_SELECTION_KEY,
        JSON.stringify({
          expertIds: this.expertIds,
          arbiterId: this.arbiterId,
        }),
      );
    } catch {
      // ignore storage errors
    }
  };
}

export const AiArbiterAgentsStoreContext =
  React.createContext<AiArbiterAgentsStore | null>(null);

export const AiArbiterAgentsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AiArbiterAgentsStore(), []);
  return (
    <AiArbiterAgentsStoreContext.Provider value={store}>
      {children}
    </AiArbiterAgentsStoreContext.Provider>
  );
};

export const useAiArbiterAgentsStore = (): AiArbiterAgentsStore => {
  const store = React.useContext(AiArbiterAgentsStoreContext);
  if (!store)
    throw new Error(
      "useAiArbiterAgentsStore must be used within AiArbiterAgentsStoreContextProvider",
    );
  return store;
};
