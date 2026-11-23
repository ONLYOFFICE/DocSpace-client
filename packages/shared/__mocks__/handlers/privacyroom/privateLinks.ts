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

/** FileShare.None and FileShare.Read; LinkType.External of a room link. */
const SHARE_NONE = 0;
const SHARE_READ = 2;
const LINK_TYPE_EXTERNAL = 1;

/** RoomType.CustomRoom and .VirtualDataRoom (CreateRoomRequestDto.cs). */
const ROOM_TYPE_CUSTOM = 5;
const ROOM_TYPE_VDR = 8;

/**
 * FileSecurity.GetLinksSettings, asked for a link with key material: a
 * Custom room takes one primary and five additional links to the room, a
 * room of another type none; a file or a folder takes six of each kind.
 */
const ROOM_PRIMARY_LINKS = 1;
const ROOM_ADDITIONAL_LINKS = 5;
const ITEM_LINKS = 6;

/** LinkKeyMaterial.KeyBytes and .MaxPrivateKeyEncLength. */
const KEY_BYTES = 32;
const MAX_PRIVATE_KEY_ENC_LENGTH = 4096;

type LinkBody = {
  linkId?: string;
  access?: number;
  title?: string;
  expirationDate?: string | null;
  internal?: boolean;
  primary?: boolean;
  linkType?: number;
  password?: string;
  denyDownload?: boolean;
  passwordRequired?: boolean;
  linkPublicKey?: string;
  linkPrivateKeyEnc?: string;
  linkProofHash?: string;
};

export type PrivateLinkRecord = {
  id: string;
  entry: string;
  title: string;
  expirationDate: string | null;
  internal: boolean;
  primary: boolean;
  passwordRequired: boolean;
  linkPublicKey: string;
  linkPrivateKeyEnc: string;
  linkProofHash: string;
};

export type PrivateLinksHandlerHandle = {
  getLinks: () => PrivateLinkRecord[];
  /** Whether the caller manages the links of the room: its owner or a room manager. */
  setCanManage: (canManage: boolean) => void;
  reset: () => void;
};

export type PrivateLinksHandlerOptions = {
  roomId: number;
  /** RoomType of the private room; a Custom room unless said otherwise. */
  roomType?: number;
  folderIds?: number[];
  fileIds?: number[];
  /** Ids a user, a group or another share holds, which a new link cannot take. */
  takenIds?: string[];
  handle?: { current: PrivateLinksHandlerHandle | null };
};

const refusal = (statusCode: number, message: string): Response =>
  new Response(JSON.stringify({ error: { message }, status: 1, statusCode }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });

const okResponse = <T>(response: T): Response =>
  new Response(JSON.stringify({ response, status: 0, statusCode: 200 }), {
    headers: { "Content-Type": "application/json" },
  });

const denied = () => refusal(403, "Access denied");
const badField = (field: string) =>
  refusal(
    400,
    `Value does not fall within the expected range. (Parameter '${field}')`,
  );

/** LinkKeyMaterial.HasLength: the canonical base64 of exactly 32 bytes. */
const hasKeyLength = (value?: string) => {
  if (!value || value.length !== 44) return false;
  try {
    const bytes = atob(value);
    return bytes.length === KEY_BYTES && btoa(bytes) === value;
  } catch {
    return false;
  }
};

/**
 * The external links of a private room and of its folders and files, as
 * FileSharingAceHelper.ValidatePrivateLinksAsync accepts and refuses them
 * before anything is stored: 403 for a caller who does not manage the room's
 * links, an invitation link, a new link without key material, an access
 * other than reading, the download ban, and a link that asks for no password
 * unless it is a link to one file with an end date; 400 for a new link under
 * an id somebody holds, a malformed field of the key material, another
 * public key for a link that has one, and a password. `passwordRequired`
 * left out counts as true for a new link and keeps the stored value. A link
 * set to FileShare.None is revoked with its key material. The answer of a
 * link carries `passwordRequired` and `linkPublicKey`, never the sealed key
 * or the proof hash, and its address is the short one, without a fragment.
 * A member who does not manage the links reads an empty list. A new link
 * over the limit of its entry is refused with 403 and the message of
 * ErrorMessage_MaxLinksCount (SetAceLinkAsync turns the warning of
 * SetAceObjectAsync into an InvalidOperationException), and a link in a
 * Virtual Data Room is for portal users whatever the request asks.
 */
export const privateLinksHandlers = (
  port: string,
  opts: PrivateLinksHandlerOptions,
) => {
  const links: PrivateLinkRecord[] = [];
  let canManage = true;
  let nextCode = 1;

  const handle: PrivateLinksHandlerHandle = {
    getLinks: () => links.map((link) => ({ ...link })),
    setCanManage: (value) => {
      canManage = value;
    },
    reset: () => {
      links.length = 0;
      canManage = true;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const origin = `${BASE_URL}:${port}`;
  const api = `${origin}/${API_PREFIX}/files`;

  const toDto = (link: PrivateLinkRecord) => ({
    access: SHARE_READ,
    sharedTo: {
      id: link.id,
      title: link.title,
      shareLink: `${origin}/s/${link.id.slice(0, 15)}`,
      expirationDate: link.expirationDate,
      linkType: LINK_TYPE_EXTERNAL,
      passwordRequired: link.passwordRequired,
      linkPublicKey: link.linkPublicKey,
      denyDownload: false,
      isExpired: false,
      primary: link.primary,
      internal: link.internal,
      requestToken: `token-${link.id}`,
    },
    isLocked: false,
    isOwner: false,
    canEditAccess: false,
    canEditInternal: true,
    canEditDenyDownload: false,
    canEditExpirationDate: true,
    canRevoke: true,
    subjectType: link.primary ? 4 : 1,
  });

  const roomType = opts.roomType ?? ROOM_TYPE_CUSTOM;

  const limitOf = (entry: string, primary: boolean) => {
    if (entry.indexOf("room:") !== 0) return ITEM_LINKS;
    if (roomType !== ROOM_TYPE_CUSTOM) return 0;
    return primary ? ROOM_PRIMARY_LINKS : ROOM_ADDITIONAL_LINKS;
  };

  const set = async (entry: string, isFile: boolean, request: Request) => {
    const body = (await request.json()) as LinkBody;
    if (!canManage) return denied();

    const existing = links.find(
      (link) => link.entry === entry && link.id === body.linkId,
    );

    if (body.access === SHARE_NONE) {
      if (existing) links.splice(links.indexOf(existing), 1);
      return okResponse(null);
    }

    if (body.linkType !== undefined && body.linkType !== LINK_TYPE_EXTERNAL) {
      return denied();
    }

    const isTaken =
      !!body.linkId &&
      ((opts.takenIds ?? []).indexOf(body.linkId) !== -1 ||
        links.some((link) => link.id === body.linkId));
    if (!existing && isTaken) return badField("linkId");

    const hasMaterial =
      !!body.linkPublicKey || !!body.linkPrivateKeyEnc || !!body.linkProofHash;
    if (!hasMaterial && !existing) return denied();
    if (hasMaterial) {
      if (!hasKeyLength(body.linkPublicKey)) return badField("linkPublicKey");
      if (
        !body.linkPrivateKeyEnc ||
        body.linkPrivateKeyEnc.length > MAX_PRIVATE_KEY_ENC_LENGTH
      ) {
        return badField("linkPrivateKeyEnc");
      }
      if (!hasKeyLength(body.linkProofHash)) return badField("linkProofHash");
      if (existing && existing.linkPublicKey !== body.linkPublicKey) {
        return badField("linkPublicKey");
      }
    }

    if ((body.access ?? SHARE_READ) !== SHARE_READ || body.denyDownload) {
      return denied();
    }
    if (body.password) return badField("password");

    const passwordRequired =
      body.passwordRequired ?? existing?.passwordRequired ?? true;
    const expirationDate = body.expirationDate ?? null;
    if (!passwordRequired && !(isFile && expirationDate)) return denied();

    if (!existing) {
      const primary = !!body.primary;
      const limit = limitOf(entry, primary);
      const held = links.filter(
        (link) => link.entry === entry && link.primary === primary,
      ).length;
      if (held >= limit) {
        return refusal(
          403,
          `The maximum number of links may not exceed ${limit}`,
        );
      }
    }

    const link: PrivateLinkRecord = {
      id: body.linkId || `00000000-0000-4000-8000-${String(nextCode++).padStart(12, "0")}`,
      entry,
      title: body.title || existing?.title || "External link",
      expirationDate,
      internal:
        roomType === ROOM_TYPE_VDR
          ? true
          : (body.internal ?? existing?.internal ?? false),
      primary: body.primary ?? existing?.primary ?? false,
      passwordRequired,
      linkPublicKey: body.linkPublicKey ?? existing!.linkPublicKey,
      linkPrivateKeyEnc: body.linkPrivateKeyEnc ?? existing!.linkPrivateKeyEnc,
      linkProofHash: body.linkProofHash ?? existing!.linkProofHash,
    };
    if (existing) links[links.indexOf(existing)] = link;
    else links.push(link);

    return okResponse(toDto(link));
  };

  const list = (entry: string) =>
    okResponse(
      canManage ? links.filter((link) => link.entry === entry).map(toDto) : [],
    );

  const routes = [
    { path: `rooms/${opts.roomId}`, entry: `room:${opts.roomId}`, isFile: false },
    ...(opts.folderIds ?? []).map((id) => ({
      path: `folder/${id}`,
      entry: `folder:${id}`,
      isFile: false,
    })),
    ...(opts.fileIds ?? []).map((id) => ({
      path: `file/${id}`,
      entry: `file:${id}`,
      isFile: true,
    })),
  ];

  return routes.flatMap(({ path, entry, isFile }) => [
    /** setRoomLink, setFolderPrimaryExternalLink, setFileExternalLink. */
    http.put(`${api}/${path}/links`, ({ request }) =>
      set(entry, isFile, request),
    ),
    /** getRoomLinks, getFolderLinks, getFileLinks. */
    http.get(`${api}/${path}/links`, () => list(entry)),
  ]);
};
