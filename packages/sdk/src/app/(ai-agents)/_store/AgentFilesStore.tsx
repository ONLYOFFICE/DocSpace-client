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
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";

// One store, two slots (knowledge / result). Avoids spinning up two
// providers for tabs that never co-exist on screen.
type Slot = "knowledge" | "result";

class AgentFilesStore {
  files: Record<Slot, TFile[]> = { knowledge: [], result: [] };

  isLoading: Record<Slot, boolean> = { knowledge: false, result: false };

  private aborts: Record<Slot, AbortController | null> = {
    knowledge: null,
    result: null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  fetch = async (slot: Slot, folderId: number) => {
    this.aborts[slot]?.abort();
    const controller = new AbortController();
    this.aborts[slot] = controller;

    runInAction(() => {
      this.isLoading[slot] = true;
    });

    try {
      const filter = FilesFilter.getDefault();
      const data = await api.files.getFolder(folderId, filter, controller.signal);
      if (controller.signal.aborted) return;
      runInAction(() => {
        this.files[slot] = data.files;
      });
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      if (!controller.signal.aborted) {
        runInAction(() => {
          this.isLoading[slot] = false;
        });
      }
    }
  };

  reset = (slot: Slot) => {
    this.aborts[slot]?.abort();
    this.aborts[slot] = null;
    runInAction(() => {
      this.files[slot] = [];
      this.isLoading[slot] = false;
    });
  };

  // Abort an in-flight fetch for a slot without clearing the loaded files —
  // symmetric with the per-fetch abort in `fetch`, used by callers (e.g.
  // unmounted list views) to prevent late writes against stale state.
  cancelFetch = (slot: Slot) => {
    this.aborts[slot]?.abort();
    this.aborts[slot] = null;
    runInAction(() => {
      this.isLoading[slot] = false;
    });
  };
}

const Ctx = React.createContext<AgentFilesStore | null>(null);

export const AgentFilesStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AgentFilesStore(), []);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
};

export const useAgentFilesStore = () => {
  const store = React.useContext(Ctx);
  if (!store)
    throw new Error(
      "useAgentFilesStore must be used within AgentFilesStoreContextProvider",
    );
  return store;
};

export default AgentFilesStore;
