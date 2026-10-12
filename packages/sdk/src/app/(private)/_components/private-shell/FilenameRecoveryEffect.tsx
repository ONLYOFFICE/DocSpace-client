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

// PARITY-SOURCE: packages/client/src/components/EncryptionProviderWrapper.jsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko

"use client";

import React from "react";

import { useEncryption } from "@docspace/shared/context/encryption";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { usePrivateRoomFilesStoreOptional } from "../../_store/PrivateRoomFilesStore";
import { useEncryptionIdentityStore } from "../../_store/EncryptionIdentityStore";

// Triggers filename recovery on unlock. No-op outside of a room-files page
// (e.g. on the rooms list), where the store has no active roomId. Bails out
// when the current view has no folder context (loading transition) or the
// identity is missing (e.g. lock raced ahead).
const FilenameRecoveryEffect: React.FC = () => {
  const { isUnlocked, getIdentity } = useEncryption();
  const filesStore = usePrivateRoomFilesStoreOptional();
  const filesListStore = useFilesListStore();
  const identityStore = useEncryptionIdentityStore();

  React.useEffect(() => {
    if (!isUnlocked) return;
    if (!filesStore) return;
    if (!filesStore.roomId) return;
    const userId = identityStore.userKeys?.userId;
    if (!userId) return;
    const identity = getIdentity();
    if (!identity) return;
    void filesStore.recoverEncryptedFilenamesForCurrentView(
      filesListStore.items,
      userId,
      identity,
    );
  }, [
    isUnlocked,
    filesStore,
    filesStore?.roomId,
    filesListStore.items,
    identityStore.userKeys?.userId,
    getIdentity,
  ]);

  return null;
};

export default FilenameRecoveryEffect;
