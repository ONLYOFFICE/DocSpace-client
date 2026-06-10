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
import { makeAutoObservable } from "mobx";

import {
  countActiveEncryptedUploadsForRoom,
  type OrchestratorUploadStore,
} from "@docspace/shared/services/private-room/encrypted-upload-orchestrator";
import type { UploadQueueItem } from "@docspace/shared/utils/uploadErrors";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";

// Thin observable wrapper around the shared encrypted-upload orchestrator.
// Owns:
//   - quotaErrorRaised — surfaces to the toast layer
//   - inFlightControllers — for AbortOnLockEffect to fan-out cancellation
// All file/progress state stays in (docspace)/UploadStore — we don't shadow
// it to keep a single source of truth for the progress UI.

class PrivateEncryptedUploadStore {
  quotaErrorRaised = false;
  inFlightControllers: Set<AbortController> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  setQuotaErrorRaised = (raised: boolean) => {
    this.quotaErrorRaised = raised;
  };

  registerController = (controller: AbortController) => {
    this.inFlightControllers.add(controller);
  };

  releaseController = (controller: AbortController) => {
    this.inFlightControllers.delete(controller);
  };

  abortAll = (reason: string = "user-cancelled") => {
    for (const c of this.inFlightControllers) {
      try {
        c.abort(reason);
      } catch {
        // ignore
      }
    }
    this.inFlightControllers.clear();
  };
}

const PrivateEncryptedUploadStoreContext =
  React.createContext<PrivateEncryptedUploadStore | null>(null);

export const PrivateEncryptedUploadStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new PrivateEncryptedUploadStore(), []);
  return (
    <PrivateEncryptedUploadStoreContext.Provider value={store}>
      {children}
    </PrivateEncryptedUploadStoreContext.Provider>
  );
};

export const usePrivateEncryptedUploadStore =
  (): PrivateEncryptedUploadStore => {
    const store = React.useContext(PrivateEncryptedUploadStoreContext);
    if (!store) {
      throw new Error(
        "usePrivateEncryptedUploadStore must be used within a PrivateEncryptedUploadStoreProvider",
      );
    }
    return store;
  };

/**
 * Returns the active encrypted upload count for a room — used by the member
 * revocation flow to gate "Remove member" when an upload still races to wrap
 * its DEK for them. Reads from the (docspace) UploadStore and reshapes to
 * the orchestrator's queue-item interface.
 */
export const useActiveEncryptedUploadsForRoom = (
  roomId: string | number | null | undefined,
): number => {
  const uploadStore = useUploadStore();
  const adapter = React.useMemo<OrchestratorUploadStore>(
    () => ({
      get files(): ReadonlyArray<UploadQueueItem> {
        return uploadStore.items.map((i) => ({
          toFolderId: i.folderId,
          action:
            i.status === "uploaded"
              ? "uploaded"
              : i.status === "cancelled"
                ? "cancelled"
                : i.status === "error"
                  ? "error"
                  : "upload",
          error: i.status === "error" ? i.error : undefined,
          cancel: i.status === "cancelled",
        }));
      },
    }),
    [uploadStore],
  );
  return countActiveEncryptedUploadsForRoom(adapter, roomId);
};
