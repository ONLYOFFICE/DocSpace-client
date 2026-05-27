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
import { observer } from "mobx-react";

import { useEncryption } from "@docspace/shared/context/encryption";

import { useEncryptionIdentityStore } from "../../_store/EncryptionIdentityStore";
import {
  BROADCAST_LOCK_SESSION_ID,
  getBroadcastLockChannelName,
  type BroadcastLockMessage,
} from "../../_utils/broadcast-lock";

// Mirrors lock() events across browser tabs scoped to the current user.
// Tab A unlocks → Tab B also has access; Tab A locks → Tab B locks < 200ms.
// User-scoped channel name prevents cross-user leakage on shared machines.
const BroadcastLockSync: React.FC = observer(() => {
  const { lock, isUnlocked } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const userId = identityStore.userKeys?.userId;
  const bcRef = React.useRef<BroadcastChannel | null>(null);
  const wasUnlockedRef = React.useRef(false);

  React.useEffect(() => {
    if (!userId || typeof BroadcastChannel === "undefined") return undefined;
    const bc = new BroadcastChannel(getBroadcastLockChannelName(userId));
    bcRef.current = bc;
    bc.onmessage = (e: MessageEvent<BroadcastLockMessage>) => {
      if (
        e.data?.type === "lock" &&
        e.data?.sessionId !== BROADCAST_LOCK_SESSION_ID
      ) {
        lock();
      }
    };
    return () => {
      bc.close();
      if (bcRef.current === bc) bcRef.current = null;
    };
  }, [userId, lock]);

  // Emit lock only on the unlocked→locked transition, not on the initial
  // mount or on remote-induced locks (those come back as no-ops anyway).
  React.useEffect(() => {
    if (isUnlocked) {
      wasUnlockedRef.current = true;
      return;
    }
    if (!wasUnlockedRef.current || !bcRef.current) return;
    wasUnlockedRef.current = false;
    const msg: BroadcastLockMessage = {
      type: "lock",
      sessionId: BROADCAST_LOCK_SESSION_ID,
    };
    bcRef.current.postMessage(msg);
  }, [isUnlocked]);

  return null;
});

export default BroadcastLockSync;
