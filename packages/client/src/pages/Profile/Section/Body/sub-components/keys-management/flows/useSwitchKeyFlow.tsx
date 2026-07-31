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
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  getActiveKeyId,
  setActiveKeyId,
} from "@docspace/shared/services/encryption/active-key-preference";
import {
  clearRotationState,
  getRotationState,
  type RotationState,
} from "@docspace/shared/services/encryption/rotation-state";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { PassphraseModal } from "@docspace/shared/dialogs/passphrase-modal";

import { isRotationRunning, type RewrapSummary } from "./rotation-runner";
import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Deps = {
  userId?: string;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  requireIdentity: () => Promise<IdentityKeyPair | null>;
  rotateForAllRooms: (
    oldIdentity: IdentityKeyPair | null,
    newIdentity: IdentityKeyPair,
    currentUserId: string,
    newPublicKeyId: string,
    oldKeyId?: string,
  ) => Promise<RewrapSummary | null>;
  refreshKeysFromServer: () => Promise<void>;
};

export type SwitchKeyFlow = {
  switchTo: (keyId: string) => Promise<void>;
  pendingState: RotationState | null;
  dismiss: () => void;
  isDismissed: boolean;
  isPending: boolean;
  modals: ReactNode;
};

function dismissKey(userId: string): string {
  return `encryption-rotation-resume-dismissed:${userId}`;
}

export function useSwitchKeyFlow({
  userId,
  encryptionKeys,
  requireIdentity,
  rotateForAllRooms,
  refreshKeysFromServer,
}: Deps): SwitchKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [pendingState, setPendingState] = useState<RotationState | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [targetRow, setTargetRow] = useState<TEncryptionKeyPair | null>(null);
  const [sourceIdentity, setSourceIdentity] = useState<IdentityKeyPair | null>(
    null,
  );
  const [passphraseError, setPassphraseError] = useState<string | null>(null);

  const refreshPendingState = useCallback(() => {
    if (!userId) {
      setPendingState(null);
      return;
    }
    const state = getRotationState(userId);
    const targetStillRegistered =
      state !== null &&
      (encryptionKeys ?? []).some((k) => String(k.id) === state.newKeyId);
    setPendingState(
      state !== null && targetStillRegistered && !isRotationRunning()
        ? state
        : null,
    );
    try {
      setIsDismissed(sessionStorage.getItem(dismissKey(userId)) === "1");
    } catch {
      setIsDismissed(false);
    }
  }, [userId, encryptionKeys]);

  useEffect(() => {
    refreshPendingState();
  }, [refreshPendingState]);

  const dismiss = useCallback(() => {
    if (!userId) return;
    try {
      sessionStorage.setItem(dismissKey(userId), "1");
    } catch {
    }
    setIsDismissed(true);
  }, [userId]);

  const switchTo = useCallback(
    async (keyId: string) => {
      if (!userId || isPending) return;
      if (targetRow !== null) return;
      if (keyId === getActiveKeyId(userId)) return;

      const target = (encryptionKeys ?? []).find(
        (k) => String(k.id) === keyId,
      );
      if (!target) {
        toastr.error(t("Common:EncryptionError"));
        return;
      }

      let source: IdentityKeyPair | null = null;
      const prevActiveId = getActiveKeyId(userId);
      if (prevActiveId && prevActiveId !== keyId) {
        setIsPending(true);
        try {
          source = await requireIdentity();
        } catch (error) {
          console.error("Unlocking the current key failed:", error);
          toastr.error(getEncryptionErrorMessage(t, error));
          return;
        } finally {
          setIsPending(false);
        }
      }
      setSourceIdentity(source);
      setPassphraseError(null);
      setTargetRow(target);
    },
    [userId, isPending, targetRow, encryptionKeys, requireIdentity, t],
  );

  const onTargetPassphraseSubmit = useCallback(
    async (passphrase: string) => {
      if (!userId || !targetRow) return;
      const targetId = String(targetRow.id);
      setIsPending(true);
      setPassphraseError(null);
      try {
        const targetIdentity = await unlockWithPassphrase(
          {
            publicKey: targetRow.publicKey,
            privateKeyEnc: targetRow.privateKeyEnc,
          },
          passphrase,
        );
        setTargetRow(null);

        const prevActiveId = getActiveKeyId(userId) ?? undefined;

        let adoptTarget: boolean;
        if (!sourceIdentity) {
          adoptTarget = true;
        } else {
          const summary = await rotateForAllRooms(
            sourceIdentity,
            targetIdentity,
            userId,
            targetId,
            prevActiveId,
          );
          if (!summary) {
            adoptTarget = false;
          } else if (summary.filesFailed === 0) {
            adoptTarget = true;
          } else if (
            summary.filesDone === 0 &&
            summary.filesUnreadable === summary.filesFailed
          ) {
            clearRotationState(userId);
            adoptTarget = true;
          } else {
            adoptTarget = false;
          }
        }

        if (adoptTarget) {
          setActiveKeyId(userId, targetId);
          SecretStorage.cacheUnlocked(userId, targetIdentity);
          toastr.success(t("Common:EncryptionKeyActivated"));
        }
        await refreshKeysFromServer();
        refreshPendingState();
      } catch (error) {
        if (error instanceof InvalidPassphraseError) {
          setPassphraseError(t("Common:InvalidPassphrase"));
        } else {
          toastr.error(getEncryptionErrorMessage(t, error));
          console.error("Switch key re-encryption failed:", error);
          setTargetRow(null);
        }
      } finally {
        setIsPending(false);
      }
    },
    [
      userId,
      targetRow,
      sourceIdentity,
      rotateForAllRooms,
      refreshKeysFromServer,
      refreshPendingState,
      t,
    ],
  );

  const modals = (
    <>
      {targetRow !== null ? (
        <PassphraseModal
          visible
          isNew={false}
          onSubmit={onTargetPassphraseSubmit}
          onCancel={() => {
            setTargetRow(null);
            setSourceIdentity(null);
            setPassphraseError(null);
          }}
          isLoading={isPending}
          externalError={passphraseError}
          title={t("Common:SwitchKeyPassphraseTitle")}
          description={t("Common:SwitchKeyPassphraseHint")}
        />
      ) : null}
    </>
  );

  return { switchTo, pendingState, dismiss, isDismissed, isPending, modals };
}
