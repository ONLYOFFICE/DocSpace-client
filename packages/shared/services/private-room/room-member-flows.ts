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

import {
  getRoomCandidateKeys,
  getRoomMissingFileKeys,
} from "../../api/privacy";
import { setRoomSecurity } from "../../api/rooms";
import type { IdentityKeyPair } from "../encryption/types";
import {
  addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers,
  rewrapMissingFilesForMember,
  validateMembersForEncryption,
  type NewRoomMember,
  type RoomEncryptionOptions,
  type SkippedRoomMember,
} from "./room-encryption";
import { selectMemberKeys } from "./room-member-keys";
import { pendingAccessStore } from "./pending-access";

/** A message a membership flow asks its caller to show. */
export type TMemberFlowNotice = {
  level: "success" | "warning" | "error";
  text: string;
};

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

/** The invitees whose key passed verification, and those left out before the grant. */
export type TInviteeVerification = {
  verified: NewRoomMember[];
  skipped: SkippedRoomMember[];
};

/**
 * Verifies the invitees' keys before the room security update, through the
 * public keys of prospective members: the room access keys cover members
 * only. An invitee without a stored key, or whose changed key is refused, is
 * left out of the grant.
 * Spec: private-rooms/room-membership, "Invitees without usable keys are skipped with a warning"
 */
export async function verifyInvitees({
  roomId,
  invitees,
  currentUserId,
  onKeyChange,
}: {
  roomId: number | string;
  invitees: NewRoomMember[];
  currentUserId: string;
  onKeyChange?: RoomEncryptionOptions["onKeyChange"];
}): Promise<TInviteeVerification> {
  if (invitees.length === 0) return { verified: [], skipped: [] };

  const memberIds = invitees.map((member) => member.id);
  const candidateKeys = await getRoomCandidateKeys(roomId, memberIds);
  const displayNames: Record<string, string | undefined> = {};
  for (const member of invitees) displayNames[member.id] = member.displayName;

  const { valid, skipped } = await validateMembersForEncryption(
    Number(roomId),
    memberIds,
    currentUserId,
    onKeyChange,
    displayNames,
    selectMemberKeys(candidateKeys),
  );
  const verified = valid.map((member) => ({
    ...member,
    displayName: displayNames[member.id],
  }));
  return { verified, skipped };
}

/** How the per-invitee requests of a private-room invitation ended. */
export type TPrivateRoomInvitations<TInvitation> = {
  accepted: TInvitation[];
  /** `noKey`: refused with 403, which the server answers for a key-less user. */
  refused: { invitation: TInvitation; noKey: boolean; error: unknown }[];
  /** The responses of the accepted requests, for their warnings. */
  responses: unknown[];
};

/**
 * Sends the invitations of a private room one invitee per request, in order.
 * The server saves the invitees of a request one by one and stops at the
 * first without an encryption key, so a shared request would add the ones
 * before it without telling which.
 * Spec: private-rooms/room-membership, "Private-room invitations are sent one invitee per request"
 */
export async function sendPrivateRoomInvitations<TInvitation>(
  roomId: number | string,
  invitations: TInvitation[],
  request: Record<string, unknown>,
): Promise<TPrivateRoomInvitations<TInvitation>> {
  const result: TPrivateRoomInvitations<TInvitation> = {
    accepted: [],
    refused: [],
    responses: [],
  };

  for (const invitation of invitations) {
    try {
      const response = await setRoomSecurity(roomId, {
        ...request,
        invitations: [invitation],
      });
      result.accepted.push(invitation);
      result.responses.push(response);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      result.refused.push({ invitation, noKey: status === 403, error });
    }
  }

  return result;
}

/** The re-encryption progress of an invite, for the caller's progress bar. */
export type TInviteRewrapProgress = {
  percent: number;
  completed?: boolean;
  alert?: boolean;
};

/** An invitee the server refused; `noKey` when it answered 403. */
export type TRefusedInvitee = { member: NewRoomMember; noKey: boolean };

/** How an invitation ended for each invitee the re-wrap covered. */
export type TInviteOutcome = {
  granted: NewRoomMember[];
  pending: { member: NewRoomMember; missingFileIds: number[] }[];
  skipped: SkippedRoomMember[];
  /** The re-wrap failed as a whole, so every invitee it covered is pending. */
  failed?: true;
  /** Invitees the server refused, who never became members. */
  refused?: TRefusedInvitee[];
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

/** The warnings that name the invitees left out, by reason. */
export function skippedMemberNotices(
  t: TFunction,
  skippedMembers: SkippedRoomMember[],
  members: NewRoomMember[] = [],
): TMemberFlowNotice[] {
  const notices: TMemberFlowNotice[] = [];
  if (skippedMembers.length === 0) return notices;
  const formatName = (m: { id: string; displayName?: string }) =>
    m.displayName || members.find((n) => n.id === m.id)?.displayName || m.id;
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
  return notices;
}

// Spec: private-rooms/room-membership, "Invited members receive re-wrapped file keys"
export async function rewrapForInvitedMembers({
  t,
  roomId,
  newMembers,
  skippedBeforeGrant = [],
  currentUserId,
  identity,
  onProgress,
  onOutcome,
}: {
  t: TFunction;
  roomId: number;
  newMembers: NewRoomMember[];
  /** The invitees the verification before the grant left out. */
  skippedBeforeGrant?: SkippedRoomMember[];
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
      const allSkipped = [...skippedBeforeGrant, ...skippedMembers];
      const failures = fileResults.filter((r) => !r.success);
      const hasAlert = failures.length > 0 || allSkipped.length > 0;
      onProgress({ percent: 100, completed: true, alert: hasAlert });
      const outcome = getInviteOutcome(
        newMembers,
        allSkipped,
        missingFileIdsByMember,
      );
      for (const member of outcome.granted) {
        pendingAccessStore.clear(roomId, member.id);
      }
      for (const { member, missingFileIds } of outcome.pending) {
        pendingAccessStore.record({ roomId, userId: member.id, missingFileIds });
      }
      onOutcome?.(outcome);

      const notices = skippedMemberNotices(t, allSkipped, newMembers);

      if (failures.length > 0) {
        notices.push({
          level: "warning",
          text: t("Common:EncryptedReencryptPartialFailure", {
            count: failures.length,
          }),
        });
      } else if (allSkipped.length === 0) {
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
        skipped: skippedBeforeGrant,
        failed: true,
      });
      return [
        { level: "error", text: t("Common:EncryptedReencryptFailed") },
      ];
    });
}

/** Retries in progress, by `roomId:userId`; a second one for the same pair does nothing. */
const retriesInFlight = new Set<string>();

/**
 * Wraps again the files an invitation left the member without, as recorded
 * for them on this device, and keeps the record of whatever still failed.
 * Resolves with the notice to show, or null when nothing is recorded or a
 * retry for the member is already running.
 */
// Spec: private-rooms/room-membership, "Partial re-encryption failure is reported"
export async function retryPendingAccess({
  t,
  roomId,
  member,
  currentUserId,
  identity,
  onProgress,
}: {
  t: TFunction;
  roomId: number;
  member: NewRoomMember;
  currentUserId: string;
  identity: IdentityKeyPair;
  onProgress: (progress: TInviteRewrapProgress) => void;
}): Promise<TMemberFlowNotice | null> {
  const pending = pendingAccessStore.get(roomId, member.id);
  const retryKey = `${roomId}:${member.id}`;
  if (!pending || retriesInFlight.has(retryKey)) return null;
  retriesInFlight.add(retryKey);

  const options = {
    currentUserId,
    identity,
    onProgress: (processed: number, total: number) => {
      const percent = Math.floor((processed / total) * 100);
      onProgress({ percent });
    },
  };

  try {
    const { skippedMembers, missingFileIdsByMember } =
      pending.missingFileIds === "all"
        ? await addMembersToEncryptedRoom(roomId, [member], options)
        : await rewrapMissingFilesForMember(
            roomId,
            member.id,
            pending.missingFileIds,
            options,
          );
    const skipped = skippedMembers.find((m) => m.id === member.id);
    const missingFileIds = missingFileIdsByMember[member.id] ?? [];
    onProgress({
      percent: 100,
      completed: true,
      alert: !!skipped || missingFileIds.length > 0,
    });

    const users = member.displayName || member.id;
    if (skipped?.reason === "no-key") {
      return {
        level: "warning",
        text: t("Common:EncryptedSkippedNoKeys", { users }),
      };
    }
    if (skipped) {
      return {
        level: "warning",
        text: t("Common:EncryptedSkippedKeyMismatch", { users }),
      };
    }
    if (missingFileIds.length > 0) {
      pendingAccessStore.record({ roomId, userId: member.id, missingFileIds });
      return {
        level: "warning",
        text: t("Common:EncryptedReencryptPartialFailure", {
          count: missingFileIds.length,
        }),
      };
    }

    pendingAccessStore.clear(roomId, member.id);
    return {
      level: "success",
      text: t("Common:EncryptedAccessRestored", { user: users }),
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: the member stays pending; the failed retry is logged for triage.
    console.error("Failed to restore access to encrypted files:", error);
    onProgress({ percent: 100, completed: true, alert: true });
    return { level: "error", text: t("Common:EncryptedReencryptFailed") };
  } finally {
    retriesInFlight.delete(retryKey);
  }
}

/**
 * Retries the pending access of a member in every room it is recorded for,
 * once the user trusted the member's changed key. Resolves with the notices
 * to show, one per room.
 */
// Spec: private-rooms/room-membership, "Trusting a changed key wraps what the member missed"
export async function rewrapPendingAccessOfMember({
  t,
  member,
  currentUserId,
  identity,
}: {
  t: TFunction;
  member: NewRoomMember;
  currentUserId: string;
  identity: IdentityKeyPair;
}): Promise<TMemberFlowNotice[]> {
  const notices: TMemberFlowNotice[] = [];
  for (const { roomId } of pendingAccessStore.listForUser(member.id)) {
    const notice = await retryPendingAccess({
      t,
      roomId,
      member,
      currentUserId,
      identity,
      onProgress: () => {},
    });
    if (notice) notices.push(notice);
  }
  return notices;
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

/**
 * Wraps for the candidate owner of a private room the encrypted files the
 * server lists them as lacking an entry on, which the server refuses to
 * hand the room over with. Resolves with the ids of the files the candidate
 * still lacks: every listed file when their key was refused, otherwise the
 * files whose write failed or whose entry the server did not store.
 */
// Spec: private-rooms/room-membership, "Ownership transfer wraps the candidate's missing files"
export async function prepareNewOwner({
  roomId,
  candidateId,
  currentUserId,
  identity,
}: {
  roomId: number | string;
  candidateId: string;
  currentUserId: string;
  identity: IdentityKeyPair;
}): Promise<{ missingFileIds: number[] }> {
  const candidate = candidateId.toLowerCase();
  const listed = await getRoomMissingFileKeys(roomId, [candidateId]);
  const fileIds =
    listed.find((entry) => entry.userId.toLowerCase() === candidate)
      ?.fileIds ?? [];
  if (fileIds.length === 0) return { missingFileIds: [] };

  const { skippedMembers, missingFileIdsByMember } =
    await rewrapMissingFilesForMember(Number(roomId), candidateId, fileIds, {
      currentUserId,
      identity,
      onKeyChange: async () => "refuse",
    });
  if (skippedMembers.some((member) => member.id === candidateId)) {
    return { missingFileIds: fileIds };
  }
  const stillMissing = new Set(missingFileIdsByMember[candidateId] ?? []);
  return { missingFileIds: fileIds.filter((id) => stillMissing.has(id)) };
}
