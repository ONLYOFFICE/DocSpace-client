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

import { useCallback, useEffect, useRef, useState } from "react";

import { useEncryption } from "../../context/encryption";
import {
  hasPasskeyUnlock,
  isPasskeyUnlockAvailable,
  unlockWithPasskey,
} from "../../services/encryption/passkey-unlock";
import type { IdentityKeyPair } from "../../services/encryption/types";

export type PasskeyUnlock = {
  available: boolean;
  isUnlocking: boolean;
  unlock: () => Promise<void>;
  abort: () => void;
};

export function usePasskeyUnlock(
  userId: string | undefined,
  onUnlocked?: (kp: IdentityKeyPair) => void,
): PasskeyUnlock {
  const { publicKey } = useEncryption();
  const [available, setAvailable] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userId || !publicKey) {
      setAvailable(false);
      return undefined;
    }
    let cancelled = false;
    void Promise.all([
      isPasskeyUnlockAvailable(),
      hasPasskeyUnlock(userId, publicKey),
    ]).then(([platformOk, enrolled]) => {
      if (!cancelled) setAvailable(platformOk && enrolled);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, publicKey]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const unlock = useCallback(async () => {
    if (!userId || !publicKey) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsUnlocking(true);
    try {
      const result = await unlockWithPasskey(
        userId,
        publicKey,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result.status === "ok") {
        onUnlocked?.(result.kp);
      } else if (result.status === "failed") {
        setAvailable(await hasPasskeyUnlock(userId, publicKey));
      }
    } finally {
      setIsUnlocking(false);
    }
  }, [userId, publicKey, onUnlocked]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { available, isUnlocking, unlock, abort };
}
