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

import { recoverEncryptedFilenames } from "@docspace/shared/services/private-room/encrypted-filename-recovery";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

// Holds per-room private-files context (roomId, isPrivateRoomFolder) and
// orchestrates filename recovery after unlock. The actual list of items
// lives in FilesListStore; we pull it in here on-demand to avoid coupling.

type RecoveryItem = {
  id: number | string;
  encrypted?: boolean;
  viewUrl?: string;
};

class PrivateRoomFilesStore {
  roomId: string | number | null = null;
  isPrivateRoomFolder = false;

  constructor() {
    makeAutoObservable(this);
  }

  setRoomContext = (roomId: string | number | null, isPrivate: boolean) => {
    this.roomId = roomId;
    this.isPrivateRoomFolder = isPrivate;
  };

  reset = () => {
    this.roomId = null;
    this.isPrivateRoomFolder = false;
  };

  recoverEncryptedFilenamesForCurrentView = async (
    items: ReadonlyArray<RecoveryItem>,
    userId: string,
    identity: IdentityKeyPair,
  ): Promise<void> => {
    if (!this.roomId) return;
    const candidates = items
      .filter(
        (f): f is RecoveryItem & { id: number; viewUrl: string } =>
          !!f.encrypted &&
          (typeof f.id === "number" || typeof f.id === "string") &&
          !!f.viewUrl,
      )
      .map((f) => ({ id: Number(f.id), viewUrl: f.viewUrl }));
    if (candidates.length === 0) return;
    await recoverEncryptedFilenames(candidates, userId, identity, this.roomId);
  };
}

const PrivateRoomFilesStoreContext =
  React.createContext<PrivateRoomFilesStore | null>(null);

export const PrivateRoomFilesStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new PrivateRoomFilesStore(), []);
  return (
    <PrivateRoomFilesStoreContext.Provider value={store}>
      {children}
    </PrivateRoomFilesStoreContext.Provider>
  );
};

export const usePrivateRoomFilesStore = (): PrivateRoomFilesStore => {
  const store = React.useContext(PrivateRoomFilesStoreContext);
  if (!store) {
    throw new Error(
      "usePrivateRoomFilesStore must be used within a PrivateRoomFilesStoreProvider",
    );
  }
  return store;
};

// Returns null outside of a room-files page (e.g. on the rooms list).
// Used by FilenameRecoveryEffect that lives one provider level up.
export const usePrivateRoomFilesStoreOptional =
  (): PrivateRoomFilesStore | null => {
    return React.useContext(PrivateRoomFilesStoreContext);
  };
