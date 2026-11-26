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

import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

/** ExternalShare.Status, as `GET files/share/{key}` answers it. */
const STATUS_OK = 0;
const STATUS_INVALID = 1;
const STATUS_EXPIRED = 2;
const STATUS_REQUIRED_PASSWORD = 3;
const STATUS_INVALID_PASSWORD = 4;

export type PrivateLinkVisitorOptions = {
  /** The signed key of the link, which the address carries as `key`. */
  key: string;
  linkId: string;
  /** The file, folder or room the link is set on, and its kind: FileEntryType.Folder (1) or .File (2). */
  entryId: number;
  entryType: 1 | 2;
  title?: string;
  passwordRequired: boolean;
  /** The key material the link was stored with. */
  linkPublicKey: string;
  linkPrivateKeyEnc: string;
  linkProofHash: string;
  /** The public keys of the members of the room, as the keys of a file list them. */
  memberKeys: Array<{ id: string; userId: string; publicKey: string }>;
  /** The files the link covers, each with the wrap made for the link, or null when none is made yet. */
  files: Record<number, string | null>;
  /**
   * How many wrong proofs the portal takes before it refuses the address
   * (BruteForceLoginManager, by the portal's login settings).
   */
  wrongProofsLimit?: number;
  handle?: { current: PrivateLinkVisitorHandle | null };
};

export type PrivateLinkVisitorHandle = {
  /** A gate closes the link, or it is revoked: it answers as invalid. */
  setClosed: (closed: boolean) => void;
  setExpired: (expired: boolean) => void;
  /** Whether a matching proof has opened the session of the link. */
  isOpen: () => boolean;
  /** A new password or a revocation ends the session. */
  endSession: () => void;
  reset: () => void;
};

const json = <T>(response: T, statusCode = 200): Response =>
  new Response(JSON.stringify({ response, status: 0, statusCode }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });

const refusal = (statusCode: number, message: string): Response =>
  new Response(JSON.stringify({ error: { message }, status: 1, statusCode }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/** LinkKeyMaterial.ProofMatches: SHA-256 of the 32 bytes of the proof against the stored hash. */
const proofMatches = async (proof: unknown, proofHash: string) => {
  if (typeof proof !== "string" || !proof) return false;
  let bytes: Uint8Array;
  try {
    const binary = atob(proof);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  } catch {
    return false;
  }
  if (bytes.length !== 32) return false;
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  return toBase64(hash) === proofHash;
};

/**
 * What a visitor of an external link of a private item is answered, as
 * ExternalLinkHelper.ValidateAsync, ExternalShare.ValidatePrivateLinkAsync,
 * SecurityController.ApplyExternalSharePassword and
 * EncryptionKeyPairDtoHelper.GetLinkSessionKeysAsync do it.
 *
 * `GET files/share/{key}`: the status with the id and the kind of the entry
 * the link is set on (ExternalShareDto.Id, .Type), `isPrivate` and
 * `passwordRequired`; RequiredPassword until a proof has opened the
 * session, also for a link that asks for no password, then Ok; Invalid for
 * a link a gate closes or that is revoked, Expired past its end date. It
 * never carries the sealed key.
 *
 * `POST files/share/{key}/password`: `proof` is the base64 of 32 bytes; its
 * SHA-256 is compared with the stored hash, and `password` is not looked
 * at. A match opens the session and answers Ok with `linkPrivateKeyEnc`; a
 * mismatch ends the session and answers InvalidPassword. Wrong proofs are
 * counted, and past the limit the address is refused with 403, a right
 * proof included.
 *
 * `GET files/file/{fileId}/publickeys` with the request token of the link:
 * inside the session, the public keys of the members without a private
 * half, and one entry of the link with `isLink` and `fileKeyEnc`, null when
 * no member has made the wrap; 403 without the token, outside the session
 * and for a file the link does not cover.
 */
export const privateLinkVisitorHandlers = (
  port: string,
  opts: PrivateLinkVisitorOptions,
) => {
  let closed = false;
  let expired = false;
  let open = false;
  let wrongProofs = 0;

  const handle: PrivateLinkVisitorHandle = {
    setClosed: (value) => {
      closed = value;
    },
    setExpired: (value) => {
      expired = value;
    },
    isOpen: () => open,
    endSession: () => {
      open = false;
    },
    reset: () => {
      closed = false;
      expired = false;
      open = false;
      wrongProofs = 0;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const api = `${BASE_URL}:${port}/${API_PREFIX}/files`;
  const limit = opts.wrongProofsLimit ?? 5;

  const answer = (status: number, extra: object = {}) =>
    json({
      status,
      id: String(opts.entryId),
      type: opts.entryType,
      linkId: opts.linkId,
      title: opts.title ?? "",
      isPrivate: true,
      passwordRequired: opts.passwordRequired,
      ...extra,
    });

  const settled = () => {
    if (expired) return STATUS_EXPIRED;
    if (closed) return STATUS_INVALID;
    return null;
  };

  return [
    http.get(`${api}/share/${opts.key}`, () => {
      const status = settled();
      if (status !== null) return answer(status);
      return answer(open ? STATUS_OK : STATUS_REQUIRED_PASSWORD);
    }),

    http.post(`${api}/share/${opts.key}/password`, async ({ request }) => {
      if (wrongProofs >= limit) {
        return refusal(403, "Too many attempts. Please try again later");
      }
      const body = (await request.json()) as { proof?: unknown };

      const status = settled();
      if (status !== null) return answer(status);

      if (!body.proof) {
        return answer(open ? STATUS_OK : STATUS_REQUIRED_PASSWORD);
      }
      if (await proofMatches(body.proof, opts.linkProofHash)) {
        open = true;
        return answer(STATUS_OK, {
          linkPrivateKeyEnc: opts.linkPrivateKeyEnc,
        });
      }
      open = false;
      wrongProofs += 1;
      return answer(STATUS_INVALID_PASSWORD);
    }),

    http.get(`${api}/file/:fileId(\\d+)/publickeys`, ({ params, request }) => {
      const fileId = Number(params.fileId);
      const token = request.headers.get("Request-Token");
      const covered = fileId in opts.files;
      if (token !== opts.key || !open || settled() !== null || !covered) {
        return refusal(403, "Access denied");
      }
      return json([
        ...opts.memberKeys.map((key) => ({ ...key })),
        {
          id: opts.linkId,
          userId: opts.linkId,
          publicKey: opts.linkPublicKey,
          isLink: true,
          fileKeyEnc: opts.files[fileId],
        },
      ]);
    }),
  ];
};
