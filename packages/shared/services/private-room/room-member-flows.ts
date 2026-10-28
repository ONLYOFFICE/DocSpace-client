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

import type { TFunction } from "i18next";

import { getGroupById } from "../../api/groups";
import type { IdentityKeyPair } from "../encryption/types";
import {
  addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers,
  revokeMemberFromEncryptedRoom,
  validateMembersForEncryption,
  type NewRoomMember,
  type SkippedRoomMember,
} from "./room-encryption";
import { pendingAccessStore } from "./pending-access";

/** A message a membership flow asks its caller to show. */
export type TMemberFlowNotice = {
  level: "success" | "warning" | "error";
  text: string;
};

// Spec: private-rooms/room-membership, "Leaving a room revokes own access first"
export async function revokeOwnAccessOnLeave(
  roomId: number | string,
  userId: string,
): Promise<void> {
  try {
    const results = await revokeMemberFromEncryptedRoom(
      Number(roomId),
      String(userId),
      {},
    );
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      // biome-ignore lint/suspicious/noConsole: leaving goes on; the kept entries are logged for triage.
      console.error(
        `[ENCRYPTION] ${failures.length} file(s) kept the leaver's wrap entries`,
      );
    }
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: leaving goes on; the failure is logged for triage.
    console.error("[ENCRYPTION] revoke own access on leave failed:", err);
  }
}

/**
 * Removes a removed member's entries from the room's file keys; a group
 * stands for its members. Resolves with the notice to show, or null when
 * there is nothing to report.
 */
export async function revokeRemovedMemberAccess(
  t: TFunction,
  roomId: number | string,
  member: { id: number | string; isGroup?: boolean },
): Promise<TMemberFlowNotice | null> {
  try {
    let revokedIds: string[] = [String(member.id)];
    if (member.isGroup) {
      const group = await getGroupById(String(member.id), true);
      revokedIds = (group.members ?? []).map((m) => String(m.id));
      if (revokedIds.length === 0) return null;
    }

    const results = await revokeMemberFromEncryptedRoom(
      Number(roomId),
      revokedIds,
      {},
    );
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      return {
        level: "warning",
        text: t("Common:EncryptedRevokePartialFailure", {
          count: failures.length,
        }),
      };
    }
    if (results.length > 0) {
      return { level: "success", text: t("Common:EncryptedRevokeCompleted") };
    }
    return null;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: the removal stands; the failure is logged for triage.
    console.error("[ENCRYPTION] revoke encrypted access failed:", err);
    return { level: "error", text: t("Common:EncryptedRevokeFailed") };
  }
}

/** An item of the invite list: a user, or a group when `isGroup` is set. */
export type TInviteItem = {
  id?: string;
  isGroup?: boolean;
  displayName?: string;
  email?: string;
};

/** The invited people whose file keys are re-wrapped: users, not groups. */
export const getMembersToRewrap = (
  inviteItems: TInviteItem[],
): NewRoomMember[] =>
  inviteItems
    .filter((item) => item.id && !item.isGroup)
    .map((item) => ({
      id: item.id as string,
      displayName: (item.displayName || item.email) as string,
    }));

/** The re-encryption progress of an invite, for the caller's progress bar. */
export type TInviteRewrapProgress = {
  percent: number;
  completed?: boolean;
  alert?: boolean;
};

/** How an invitation ended for each invitee the re-wrap covered. */
export type TInviteOutcome = {
  granted: NewRoomMember[];
  pending: { member: NewRoomMember; missingFileIds: number[] }[];
  skipped: SkippedRoomMember[];
  /** The re-wrap failed as a whole, so every invitee it covered is pending. */
  failed?: true;
};

const getInviteOutcome = (
  newMembers: NewRoomMember[],
  skippedMembers: SkippedRoomMember[],
  missingFileIdsByMember: Record<string, number[]>,
): TInviteOutcome => {
  const memberOf = (id: string): NewRoomMember =>
    newMembers.find((m) => m.id === id) ?? { id };
  const skippedIds = new Set(skippedMembers.map((m) => m.id));
  return {
    granted: newMembers.filter(
      (m) => !skippedIds.has(m.id) && !missingFileIdsByMember[m.id],
    ),
    pending: Object.entries(missingFileIdsByMember).map(
      ([id, missingFileIds]) => ({ member: memberOf(id), missingFileIds }),
    ),
    skipped: skippedMembers.map((m) => ({
      ...m,
      displayName: m.displayName || memberOf(m.id).displayName,
    })),
  };
};

// Spec: private-rooms/room-membership, "Invited members receive re-wrapped file keys"
export async function rewrapForInvitedMembers({
  t,
  roomId,
  newMembers,
  currentUserId,
  identity,
  onProgress,
  onOutcome,
}: {
  t: TFunction;
  roomId: number;
  newMembers: NewRoomMember[];
  currentUserId: string;
  identity: IdentityKeyPair;
  onProgress: (progress: TInviteRewrapProgress) => void;
  onOutcome?: (outcome: TInviteOutcome) => void;
}): Promise<TMemberFlowNotice[]> {
  return addMembersToEncryptedRoom(roomId, newMembers, {
    currentUserId,
    identity,
    onProgress: (processed, total) => {
      const percent = Math.floor((processed / total) * 100);
      onProgress({ percent });
    },
  })
    .then(({ fileResults, skippedMembers, missingFileIdsByMember = {} }) => {
      const notices: TMemberFlowNotice[] = [];
      const failures = fileResults.filter((r) => !r.success);
      const hasAlert = failures.length > 0 || skippedMembers.length > 0;
      onProgress({ percent: 100, completed: true, alert: hasAlert });
      const outcome = getInviteOutcome(
        newMembers,
        skippedMembers,
        missingFileIdsByMember,
      );
      for (const member of outcome.granted) {
        pendingAccessStore.clear(roomId, member.id);
      }
      for (const { member, missingFileIds } of outcome.pending) {
        pendingAccessStore.record({ roomId, userId: member.id, missingFileIds });
      }
      onOutcome?.(outcome);

      if (skippedMembers.length > 0) {
        const formatName = (m: { id: string; displayName?: string }) =>
          m.displayName ||
          newMembers.find((n) => n.id === m.id)?.displayName ||
          m.id;
        const noKeyNames = skippedMembers
          .filter((m) => m.reason === "no-key")
          .map(formatName);
        const mismatchNames = skippedMembers
          .filter((m) => m.reason === "key-mismatch-refused")
          .map(formatName);
        if (noKeyNames.length > 0) {
          notices.push({
            level: "warning",
            text: t("Common:EncryptedSkippedNoKeys", {
              users: noKeyNames.join(", "),
            }),
          });
        }
        if (mismatchNames.length > 0) {
          notices.push({
            level: "warning",
            text: t("Common:EncryptedSkippedKeyMismatch", {
              users: mismatchNames.join(", "),
            }),
          });
        }
      }

      if (failures.length > 0) {
        notices.push({
          level: "warning",
          text: t("Common:EncryptedReencryptPartialFailure", {
            count: failures.length,
          }),
        });
      } else if (skippedMembers.length === 0) {
        notices.push({ level: "success", text: t("Common:UsersInvited") });
      }

      void backfillEncryptedFilesForRoomMembers(roomId, {
        currentUserId,
        identity,
        onKeyChange: async () => "refuse",
      }).catch((error) => {
        // biome-ignore lint/suspicious/noConsole: the backfill is a silent follow-up; the failure is logged for triage.
        console.error("[ENCRYPTION] Post-invite backfill failed:", error);
      });

      return notices;
    })
    .catch((error) => {
      // biome-ignore lint/suspicious/noConsole: the invite stands; the failed re-wrap is logged for triage.
      console.error("Failed to re-encrypt file keys for new members:", error);
      onProgress({ percent: 100, completed: true, alert: true });
      for (const member of newMembers) {
        pendingAccessStore.record({
          roomId,
          userId: member.id,
          missingFileIds: "all",
        });
      }
      onOutcome?.({
        granted: [],
        pending: newMembers.map((member) => ({ member, missingFileIds: [] })),
        skipped: [],
        failed: true,
      });
      return [
        { level: "error", text: t("Common:EncryptedReencryptFailed") },
      ];
    });
}

/**
 * Checks that a new owner of the room holds a verified key. Resolves with the
 * refusal to show, or null when the candidate can own the room.
 */
export async function getNewOwnerKeyRefusal(
  t: TFunction,
  roomId: number | string,
  candidate: { id: string; label?: string; displayName?: string },
  currentUserId: string,
): Promise<string | null> {
  const { skipped } = await validateMembersForEncryption(
    Number(roomId),
    [candidate.id],
    String(currentUserId),
    undefined,
    { [candidate.id]: candidate.label || candidate.displayName },
  );
  if (skipped.length === 0) return null;

  const reason = skipped[0].reason;
  const name =
    skipped[0].displayName ||
    candidate.label ||
    candidate.displayName ||
    candidate.id;
  return reason === "no-key"
    ? t("Common:EncryptedChangeOwnerNoKeys", { user: name })
    : t("Common:EncryptedChangeOwnerKeyMismatch", { user: name });
}
