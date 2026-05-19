// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, ShareAccessRights } from "@docspace/shared/enums";
import type { TAgent } from "@docspace/shared/api/ai/types";

export type AgentsViewAs = "tile" | "row" | "table";

class AgentsListStore {
  agents: TAgent[] = [];

  total = 0;

  filter: RoomsFilter = RoomsFilter.getDefault(
    undefined,
    RoomSearchArea.AIAgents,
  );

  isLoading = false;

  viewAs: AgentsViewAs = "tile";

  private abort: AbortController | null = null;

  // Per-agent in-flight set for pin/unpin — drops the second click while a
  // request is open so quick double-toggles can't desync the UI from the
  // server.
  private pinInFlight = new Set<TAgent["id"]>();

  constructor() {
    makeAutoObservable(this);
  }

  setAgents = (agents: TAgent[], total: number) => {
    this.agents = agents;
    this.total = total;
  };

  setFilter = (filter: RoomsFilter) => {
    this.filter = filter;
  };

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setViewAs = (value: AgentsViewAs) => {
    this.viewAs = value;
  };

  togglePinAgent = async (agent: TAgent) => {
    const id = agent.id;
    if (this.pinInFlight.has(id)) return;
    this.pinInFlight.add(id);

    const wasPinned = !!agent.pinned;
    runInAction(() => {
      this.agents = this.agents.map((a) =>
        a.id === id ? { ...a, pinned: !wasPinned } : a,
      );
    });
    try {
      if (wasPinned) await api.rooms.unpinRoom(id);
      else await api.rooms.pinRoom(id);
    } catch (e) {
      runInAction(() => {
        this.agents = this.agents.map((a) =>
          a.id === id ? { ...a, pinned: wasPinned } : a,
        );
      });
      throw e;
    } finally {
      this.pinInFlight.delete(id);
    }
  };

  // Optimistic removal — drop the row from state, then reconcile with the
  // server on failure via a refetch (NOT a snapshot restore). With multiple
  // concurrent removals, a per-call snapshot would resurrect rows that
  // another in-flight call had already deleted; refetching is the only safe
  // recovery.
  private optimisticRemove = async (id: TAgent["id"], call: () => Promise<unknown>) => {
    runInAction(() => {
      this.agents = this.agents.filter((a) => a.id !== id);
      this.total = Math.max(0, this.total - 1);
    });
    try {
      await call();
    } catch (e) {
      void this.fetchAgents();
      throw e;
    }
  };

  leaveAgent = (id: TAgent["id"], currentUserId: string) =>
    this.optimisticRemove(id, () =>
      api.rooms.updateRoomMemberRole(id, {
        invitations: [{ id: currentUserId, access: ShareAccessRights.None }],
      }),
    );

  deleteAgent = (id: TAgent["id"]) =>
    this.optimisticRemove(id, () => api.ai.deleteAIAgent(id));

  fetchAgents = async (filter?: RoomsFilter) => {
    const filterData = filter ? filter.clone() : this.filter.clone();

    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;

    this.setIsLoading(true);
    try {
      const data = await api.ai.getAIAgents(filterData, controller.signal);
      if (controller.signal.aborted) return;

      filterData.total = data.total;
      runInAction(() => {
        this.agents = data.folders;
        this.total = data.total;
        this.filter = filterData;
      });
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      if (!controller.signal.aborted) this.setIsLoading(false);
    }
  };

  // Append the next page to `agents` rather than replacing it. Bumps the
  // filter's page index and reuses the same abort-controller slot as
  // `fetchAgents` — a fresh filter-driven fetchAgents cancels any pending
  // fetchMore.
  fetchMore = async () => {
    if (this.isLoading) return;
    if (this.agents.length >= this.total) return;

    const filterData = this.filter.clone();
    filterData.page = (filterData.page ?? 0) + 1;

    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;

    this.setIsLoading(true);
    try {
      const data = await api.ai.getAIAgents(filterData, controller.signal);
      if (controller.signal.aborted) return;

      filterData.total = data.total;
      runInAction(() => {
        this.agents = [...this.agents, ...data.folders];
        this.total = data.total;
        this.filter = filterData;
      });
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      if (!controller.signal.aborted) this.setIsLoading(false);
    }
  };
}

const Ctx = React.createContext<AgentsListStore | null>(null);

export const AgentsListStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AgentsListStore(), []);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
};

export const useAgentsListStore = () => {
  const store = React.useContext(Ctx);
  if (!store)
    throw new Error(
      "useAgentsListStore must be used within AgentsListStoreContextProvider",
    );
  return store;
};
