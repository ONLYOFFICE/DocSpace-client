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

import { useRef, useState } from "react";
import type { TFunction } from "i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useGenerateKeyFlow } from "../dialogs/key-generation";
import { hasPrivateRoomSecureContext } from "../services/private-room/create-room-gate";

/**
 * The key-generation step of private room creation: a user without a key is
 * offered one before the room is created, and the creation closes when the
 * generation fails or, for a private room, when the offer is declined.
 */
export function usePrivateRoomKeyGate({
  t,
  userId,
  accountLabel,
  refreshKeysFromServer,
  onKeyGenerated,
  onClose,
}: {
  t: TFunction;
  userId: string | undefined;
  accountLabel?: string;
  refreshKeysFromServer: () => Promise<void>;
  onKeyGenerated?: () => void;
  onClose?: () => void;
}) {
  const [keyConfirmVisible, setKeyConfirmVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const generateKey = useGenerateKeyFlow({
    userId,
    accountLabel,
    refreshKeysFromServer,
    onSuccess: onKeyGenerated,
    onError: () => {
      onCloseRef.current?.();
    },
  });

  /**
   * Offers key generation. Returns false, with the secure-context toast,
   * where the browser has no WebCrypto.
   */
  const offerKeyGeneration = () => {
    if (!hasPrivateRoomSecureContext()) {
      toastr.error(t("Common:EncryptionRequiresHttps"));
      return false;
    }
    setKeyConfirmVisible(true);
    return true;
  };

  const confirmKeyGeneration = () => {
    setKeyConfirmVisible(false);
    generateKey.request();
  };

  /** Declines the offer; `closeCreation` closes the creation as well. */
  const cancelKeyGeneration = (closeCreation: boolean) => {
    setKeyConfirmVisible(false);
    if (closeCreation) onCloseRef.current?.();
  };

  return {
    keyConfirmVisible,
    offerKeyGeneration,
    confirmKeyGeneration,
    cancelKeyGeneration,
    keyGenerationModals: generateKey.modals,
  };
}
