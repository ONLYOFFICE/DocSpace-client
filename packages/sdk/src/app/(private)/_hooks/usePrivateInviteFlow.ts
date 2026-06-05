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
import { useTranslation } from "react-i18next";

import { useEncryption } from "@docspace/shared/context/encryption";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type InviteAfterSubmitArgs = {
  roomId: number;
  memberIds: string[];
  displayNames: Record<string, string>;
};

/** Progress of the ongoing re-encryption fan-out. */
export type ReencryptProgress = {
  /** Number of files already processed (DEK re-wrapped). */
  processed: number;
  /** Total files to process. */
  total: number;
};

type UsePrivateInviteFlowReturn = {
  /**
   * Invoked AFTER setRoomSecurity succeeds. Requires unlock, then runs
   * addMembersToEncryptedRoom to wrap existing file DEKs for the new members.
   * Skipped recipients (no-key / TOFU-refused) surface as a toastr warning;
   * other errors propagate so InvitePanel keeps itself open.
   */
  onInviteSubmitted: (
    args: InviteAfterSubmitArgs,
  ) => Promise<void>;
  /**
   * Pre-submit identity gate for use as InvitePanel's `onBeforeSubmit` prop.
   * Calls requireIdentity(); on null (locked / user cancelled) shows the
   * `EncryptionLockedAddMembers` toast and returns false, preventing
   * setRoomSecurity from being called with locked keys.
   */
  onBeforeSubmit: () => Promise<boolean>;
  isLoading: boolean;
  /**
   * Live re-encryption progress, non-null while addMembersToEncryptedRoom is
   * running. Resets to null in the finally block (success OR failure).
   * Consumers render a progress bar while this is non-null.
   */
  reencryptProgress: ReencryptProgress | null;
};

const loadRoomEncryption = () =>
  import("@docspace/shared/services/private-room/room-encryption");

/**
 * Returns true when a re-encryption error should be treated as a silent
 * abort: either the controller was already aborted before the error was
 * thrown, or the error itself is a DOM/Node AbortError.
 *
 * Exported for unit testing.
 */
export function isReencryptAbortError(
  controller: AbortController,
  error: unknown,
): boolean {
  if (controller.signal.aborted) return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

export const usePrivateInviteFlow = (): UsePrivateInviteFlowReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [reencryptProgress, setReencryptProgress] =
    React.useState<ReencryptProgress | null>(null);

  const onInviteSubmitted = React.useCallback(
    async ({ roomId, memberIds, displayNames }: InviteAfterSubmitArgs) => {
      if (memberIds.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        throw new Error(t("Common:EncryptionKeysNotConfigured"));
      }

      const identity = await requireIdentity();
      if (!identity) {
        // Cancelled passphrase dialog — surface as user-actionable error so
        // InvitePanel doesn't silently treat the invite as fully successful.
        throw new Error(t("Common:EncryptionUnlockRequired"));
      }

      const controller = registerCryptoOperation();
      setIsLoading(true);
      try {
        const { addMembersToEncryptedRoom } = await loadRoomEncryption();
        if (controller.signal.aborted) return;
        const result = await addMembersToEncryptedRoom(
          roomId,
          memberIds.map((id) => ({ id, displayName: displayNames[id] })),
          {
            currentUserId: userId,
            identity,
            onProgress: (processed, total) => {
              setReencryptProgress({ processed, total });
            },
          },
        );
        if (controller.signal.aborted) return;

        // Split skipped members by reason and show separate toasts so the
        // user understands exactly why each person was skipped.
        const noKeyNames = result.skippedMembers
          .filter((m) => m.reason === "no-key")
          .map((m) => m.displayName || m.id);
        const mismatchNames = result.skippedMembers
          .filter((m) => m.reason === "key-mismatch-refused")
          .map((m) => m.displayName || m.id);

        if (noKeyNames.length > 0) {
          toastr.warning(
            t("Common:EncryptedSkippedNoKeys", {
              users: noKeyNames.join(", "),
            }),
          );
        }
        if (mismatchNames.length > 0) {
          toastr.warning(
            t("Common:EncryptedSkippedKeyMismatch", {
              users: mismatchNames.join(", "),
            }),
          );
        }

        // Per-file failures (DEK unwrap / re-wrap errors) are a separate
        // partial-failure condition, independent of skipped members.
        const failures = result.fileResults.filter((r) => !r.success);
        if (failures.length > 0) {
          toastr.warning(
            t("Common:EncryptedReencryptPartialFailure", {
              count: failures.length,
            }),
          );
        } else if (result.skippedMembers.length === 0) {
          // Zero skipped and zero file failures → fully successful invite.
          toastr.success(t("Common:UsersInvited"));
        }

        // Silent follow-up: backfill envelopes for members who registered
        // their keypair after the initial invite (their pre-existing files
        // would otherwise stay inaccessible). Fire-and-forget; skip when
        // the operation was already aborted (user navigated away).
        if (!controller.signal.aborted) {
          void loadRoomEncryption()
            .then(({ backfillEncryptedFilesForRoomMembers }) =>
              backfillEncryptedFilesForRoomMembers(roomId, {
                currentUserId: userId,
                identity,
                onKeyChange: async () => "refuse",
              }),
            )
            .catch(() => {});
        }
      } catch (error) {
        // Abort (user locked / navigated away) is expected — stay silent.
        if (!isReencryptAbortError(controller, error)) {
          toastr.error(t("Common:EncryptedReencryptFailed"));
        }
      } finally {
        releaseCryptoOperation(controller);
        setIsLoading(false);
        setReencryptProgress(null);
      }
    },
    [requireIdentity, identityStore, t],
  );

  // Pre-submit guard wired to InvitePanel's onBeforeSubmit prop. Runs BEFORE
  // setRoomSecurity so that server access is never granted when encryption keys
  // are absent or locked. Mirrors packages/client InvitePanel:452-459 pattern.
  const onBeforeSubmit = React.useCallback(async (): Promise<boolean> => {
    const identity = await requireIdentity();
    if (!identity) {
      toastr.error(t("Common:EncryptionLockedAddMembers"));
      return false;
    }
    return true;
  }, [requireIdentity, t]);

  return { onInviteSubmitted, onBeforeSubmit, isLoading, reencryptProgress };
};
