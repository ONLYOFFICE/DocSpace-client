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

import { useRef } from "react";
import type { TFunction } from "i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useGenerateKeyFlow } from "../dialogs/key-generation";
import { hasPrivateRoomSecureContext } from "../services/private-room/create-room-gate";

/**
 * The key-setup step of private room creation: a user without a key goes
 * through key setup before the room is created, and the creation closes
 * when the setup fails or is left, as the caller decides.
 * Spec: private-rooms/room-membership, "Starting private room creation without a key opens key setup"
 */
export function usePrivateRoomKeyGate({
  t,
  userId,
  accountLabel,
  hasExistingKeys,
  isGuest,
  refreshKeysFromServer,
  onKeyGenerated,
  onKeyGenerationCancelled,
  onClose,
}: {
  t: TFunction;
  userId: string | undefined;
  accountLabel?: string;
  /** A user who already holds a key is never offered a second one. */
  hasExistingKeys?: boolean;
  /** A guest is never offered a key: the server refuses a guest's key. */
  isGuest?: boolean;
  refreshKeysFromServer: () => Promise<void>;
  onKeyGenerated?: () => void;
  /** The user left key setup on any of its steps. */
  onKeyGenerationCancelled?: () => void;
  onClose?: () => void;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onCancelledRef = useRef(onKeyGenerationCancelled);
  onCancelledRef.current = onKeyGenerationCancelled;

  const generateKey = useGenerateKeyFlow({
    userId,
    accountLabel,
    hasExistingKeys,
    refreshKeysFromServer,
    onSuccess: onKeyGenerated,
    onError: () => {
      onCloseRef.current?.();
    },
    onCancel: () => {
      onCancelledRef.current?.();
    },
  });

  /**
   * Opens key setup at once, with no question before it. Returns false, with
   * the secure-context toast, where the browser has no WebCrypto, and false
   * without one for a guest.
   */
  // Spec: private-rooms/key-management, "Key generation is withheld from guests"
  const offerKeyGeneration = () => {
    if (isGuest) return false;
    if (!hasPrivateRoomSecureContext()) {
      toastr.error(t("Common:EncryptionRequiresHttps"));
      return false;
    }
    generateKey.request();
    return true;
  };

  return {
    offerKeyGeneration,
    keyGenerationModals: generateKey.modals,
  };
}
