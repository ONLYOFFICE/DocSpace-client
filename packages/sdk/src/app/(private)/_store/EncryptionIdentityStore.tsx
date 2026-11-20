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
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import { selectUserKey } from "@docspace/shared/services/encryption/select-user-key";
import type { EncryptionUserKeys } from "@docspace/shared/context/encryption";

class EncryptionIdentityStore {
  keys: TEncryptionKeyPair[] | null = null;
  ownerId: string | null = null;
  isLoading = false;
  loadError: Error | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setOwnerId = (ownerId: string | null) => {
    this.ownerId = ownerId;
  };

  setKeys = (keys: TEncryptionKeyPair[] | null) => {
    this.keys = keys;
  };

  private inflight: Promise<void> | null = null;

  /** Loads the key list; a caller during a load gets that load's result. */
  // Spec: private-rooms/sdk-surface, "Private room creation waits for a known key list"
  loadKeys = (): Promise<void> => {
    if (this.inflight !== null) return this.inflight;
    this.isLoading = true;
    this.loadError = null;
    const load = (async () => {
      try {
        const keys = await api.privacy.getEncryptionKeys();
        runInAction(() => {
          this.keys = keys ?? [];
        });
      } catch (error) {
        // A failed load is not an empty list: the keys known before stay, and
        // a list never loaded stays unknown.
        // Spec: sdk-surface, "Private room creation gate"
        runInAction(() => {
          this.loadError =
            error instanceof Error ? error : new Error(String(error));
        });
      } finally {
        runInAction(() => {
          this.isLoading = false;
          this.inflight = null;
        });
      }
    })();
    this.inflight = load;
    return load;
  };

  /**
   * Loads the key list anew, also when a load that began before a change of
   * the keys (a key just generated) is still running.
   */
  reloadKeys = async (): Promise<void> => {
    if (this.inflight !== null) await this.inflight;
    await this.loadKeys();
  };

  reset = () => {
    this.keys = null;
    this.ownerId = null;
    this.loadError = null;
    this.isLoading = false;
  };

  // Derived: the envelope the EncryptionProvider should use on this device.
  // encryptionKeys[].userId is sometimes blank in the server response, so we
  // overlay the owner's id from the user store.
  get userKeys(): EncryptionUserKeys | null {
    if (!this.ownerId || !this.keys) return null;
    const chosen = selectUserKey(this.keys);
    if (!chosen) return null;
    return {
      publicKey: chosen.publicKey,
      privateKeyEnc: chosen.privateKeyEnc,
      userId: this.ownerId,
    };
  }

  get hasKeys(): boolean {
    return !!(this.keys && this.keys.length > 0);
  }
}

const EncryptionIdentityStoreContext =
  React.createContext<EncryptionIdentityStore | null>(null);

export const EncryptionIdentityStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new EncryptionIdentityStore(), []);
  return (
    <EncryptionIdentityStoreContext.Provider value={store}>
      {children}
    </EncryptionIdentityStoreContext.Provider>
  );
};

export const useEncryptionIdentityStore = (): EncryptionIdentityStore => {
  const store = React.useContext(EncryptionIdentityStoreContext);
  if (!store) {
    throw new Error(
      "useEncryptionIdentityStore must be used within an EncryptionIdentityStoreProvider",
    );
  }
  return store;
};
