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

import { getPortalQuota } from "@docspace/shared/api/portal";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";
import type { Nullable } from "@docspace/shared/types";

// SDK-local mirror of currentQuotaStore's AI-agent-specific getters. Keeps
// the (ai-agents) route group decoupled from the shared full quota store
// (which depends on settings + abort-controller plumbing we don't wire here).
class AgentsQuotaStore {
  currentPortalQuota: Nullable<TPaymentQuota> = null;

  isLoaded = false;

  private inflight: Promise<unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPortalQuotaValue = (value: TPaymentQuota) => {
    this.currentPortalQuota = value;
    this.isLoaded = true;
  };

  get isDefaultAIAgentsQuotaSet() {
    return this.currentPortalQuota?.aiAgentsQuota?.enableQuota ?? false;
  }

  get defaultAIAgentsQuota() {
    return this.currentPortalQuota?.aiAgentsQuota?.defaultQuota;
  }

  get isDefaultRoomsQuotaSet() {
    return this.currentPortalQuota?.roomsQuota?.enableQuota ?? false;
  }

  get defaultRoomsQuota() {
    return this.currentPortalQuota?.roomsQuota?.defaultQuota;
  }

  fetchPortalQuota = async (): Promise<void> => {
    if (this.isLoaded) return;
    const pending = this.inflight;
    if (pending !== null) {
      await pending;
      return;
    }

    this.inflight = getPortalQuota()
      .then((res) => {
        runInAction(() => {
          this.setPortalQuotaValue(res);
        });
      })
      .catch(() => {
        // Ignore — keep currentPortalQuota null so getters return safe falsy.
      })
      .finally(() => {
        this.inflight = null;
      });

    await this.inflight;
  };
}

const AgentsQuotaStoreContext =
  React.createContext<AgentsQuotaStore | null>(null);

export const AgentsQuotaStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AgentsQuotaStore(), []);
  return (
    <AgentsQuotaStoreContext.Provider value={store}>
      {children}
    </AgentsQuotaStoreContext.Provider>
  );
};

export const useAgentsQuotaStore = () => {
  const store = React.useContext(AgentsQuotaStoreContext);
  if (!store)
    throw new Error(
      "useAgentsQuotaStore must be used within AgentsQuotaStoreContextProvider",
    );
  return store;
};

export default AgentsQuotaStore;
