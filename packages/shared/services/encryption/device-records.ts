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

import {
  forgetDeviceUnlock,
  forgetExpiredDeviceUnlock,
  getDeviceUnlockPublicKey,
} from "./device-unlock-store";
import {
  getPasskeyUnlockPublicKey,
  removePasskeyUnlock,
} from "./passkey-unlock";

/**
 * Removes what this device keeps of the user's key: the remembered record
 * and the passkey record. With a public key, only the records written for
 * that key are removed.
 */
// Spec: private-rooms/key-management, "Removing the key removes what this device keeps of it"
export async function forgetKeyOnDevice(
  userId: string,
  publicKeyB64?: string,
): Promise<void> {
  if (!userId) return;
  await Promise.all([
    forgetDeviceUnlock(userId, publicKeyB64),
    removePasskeyUnlock(userId, publicKeyB64),
  ]);
}

/**
 * Removes the records this device keeps that no longer serve the user: an
 * expired remembered record always, and, once the user's key list has been
 * read, the records of a key the list does not hold. `null` stands for a
 * list that is not known and removes nothing on its account.
 */
// Spec: private-rooms/key-management, "Removing the key removes what this device keeps of it"
export async function pruneDeviceRecords(
  userId: string,
  listedPublicKeys: readonly string[] | null,
): Promise<void> {
  if (!userId) return;
  await forgetExpiredDeviceUnlock(userId);
  if (!listedPublicKeys) return;

  const listed = new Set(listedPublicKeys);
  const [rememberedKey, passkeyKey] = await Promise.all([
    getDeviceUnlockPublicKey(userId),
    getPasskeyUnlockPublicKey(userId),
  ]);
  await Promise.all([
    rememberedKey && !listed.has(rememberedKey)
      ? forgetDeviceUnlock(userId, rememberedKey)
      : undefined,
    passkeyKey && !listed.has(passkeyKey)
      ? removePasskeyUnlock(userId, passkeyKey)
      : undefined,
  ]);
}
