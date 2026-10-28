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
  getKeyMismatchHandler,
  getTofuStore,
  type KeyMismatchResolver,
} from "../encryption/tofu-store";

export type MemberKeyVerification =
  | { kind: "ok"; publicKey: string }
  | { kind: "key-mismatch-refused" };

export interface MemberKeyRecipient {
  userId: string;
  publicKey: string;
  displayName?: string;
}

type MemberKeyTrustedListener = (userId: string, scopeUserId: string) => void;

const trustedListeners = new Set<MemberKeyTrustedListener>();

/**
 * Subscribes to changed member keys the user chose to trust; returns the
 * unsubscribe.
 */
export function onMemberKeyTrusted(
  listener: MemberKeyTrustedListener,
): () => void {
  trustedListeners.add(listener);
  return () => {
    trustedListeners.delete(listener);
  };
}

export interface SkippedMemberKey {
  userId: string;
  displayName?: string;
  reason: "key-mismatch-refused";
}

/** Checks one member key against the pins of `scopeUserId`; fails closed. */
export async function verifyMemberKey(args: {
  userId: string;
  scopeUserId: string;
  publicKey: string;
  displayName?: string;
  resolver?: KeyMismatchResolver;
  /** `userId:publicKey` pairs already refused; a hit refuses without asking. */
  refusals?: Set<string>;
}): Promise<MemberKeyVerification> {
  const { userId, scopeUserId, publicKey, displayName, resolver, refusals } =
    args;
  const tofu = getTofuStore(scopeUserId);
  const result = await tofu.checkKey(userId, publicKey);
  if (result.kind === "first-seen" || result.kind === "match") {
    return { kind: "ok", publicKey };
  }

  const refusalKey = `${userId}:${publicKey}`;
  if (refusals?.has(refusalKey)) return { kind: "key-mismatch-refused" };

  const handler = resolver ?? getKeyMismatchHandler();
  if (!handler) return { kind: "key-mismatch-refused" };

  let decision: "accept" | "refuse";
  try {
    decision = await handler({
      userId,
      knownKey: result.known.publicKey,
      newKey: result.submitted,
      knownFirstSeenAt: result.known.firstSeenAt,
      knownLastSeenAt: result.known.lastSeenAt,
      displayName,
    });
  } catch (e) {
    if (typeof console !== "undefined") {
      // biome-ignore lint/suspicious/noConsole: surface resolver bugs in dev; failing closed (refused).
      console.error("Key mismatch resolver threw:", e);
    }
    return { kind: "key-mismatch-refused" };
  }
  if (decision !== "accept") {
    refusals?.add(refusalKey);
    return { kind: "key-mismatch-refused" };
  }
  await tofu.acceptKey(userId, publicKey);
  for (const listener of trustedListeners) listener(userId, scopeUserId);
  return { kind: "ok", publicKey };
}

/**
 * Verifies every recipient key before a file key is wrapped for it, one at a
 * time so that at most one key-change dialog is open.
 * Spec: private-rooms/encryption-core, "Member keys are verified against pins when granting access".
 */
export async function verifyMemberKeys<T extends MemberKeyRecipient>(
  recipients: readonly T[],
  options: {
    scopeUserId: string;
    resolver?: KeyMismatchResolver;
    refusals?: Set<string>;
  },
): Promise<{ verified: T[]; skipped: SkippedMemberKey[] }> {
  const verified: T[] = [];
  const skipped: SkippedMemberKey[] = [];
  for (const recipient of recipients) {
    const result = await verifyMemberKey({
      userId: recipient.userId,
      scopeUserId: options.scopeUserId,
      publicKey: recipient.publicKey,
      displayName: recipient.displayName,
      resolver: options.resolver,
      refusals: options.refusals,
    });
    if (result.kind === "ok") {
      verified.push(recipient);
    } else {
      skipped.push({
        userId: recipient.userId,
        displayName: recipient.displayName,
        reason: result.kind,
      });
    }
  }
  return { verified, skipped };
}
