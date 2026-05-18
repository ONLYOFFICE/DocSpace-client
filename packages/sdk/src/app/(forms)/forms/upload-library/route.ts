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

import fs from "node:fs";
import path from "node:path";

import AdmZip from "adm-zip";

import { RoomsType } from "@docspace/shared/enums";
import { createRequest } from "@docspace/shared/utils/next-ssr-helper";

import { logger } from "@/../logger.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LIBRARY_ROOM_TITLE = "AI Forms Library";
const LIBRARY_ZIP_FILENAME = "data.zip";

type CreatedRoom = { id: number };

const callJsonApi = async <T>(
  pathname: string,
  method: "GET" | "POST" | "PUT",
  body?: unknown,
): Promise<T> => {
  const [req] = await createRequest(
    [pathname],
    body !== undefined ? [["Content-Type", "application/json"]] : [],
    method,
    body !== undefined ? JSON.stringify(body) : undefined,
  );
  const res = await fetch(req);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${pathname} failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { response: T };
  return json.response;
};

// The backend returns the upload session as a flat TUploadOperation
// (response.id, response.location, ...) when single-chunk, but switches to
// a wrapper `{ data: { id, location } | [...] }` when chunked. Handle both.
type SessionUnwrapped =
  | { id: string; location?: string }
  | { data: { id: string; location?: string } | { id: string; location?: string }[] };

const extractSessionId = (payload: SessionUnwrapped): string | null => {
  if ("id" in payload && payload.id) return payload.id;
  if ("data" in payload) {
    const d = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (d?.id) return d.id;
  }
  return null;
};

let sessionDebugLogged = false;

const startSession = async (
  roomId: number,
  fileName: string,
  fileSize: number,
  relativePath: string,
): Promise<string> => {
  const payload = await callJsonApi<SessionUnwrapped>(
    `/files/${roomId}/session`,
    "POST",
    {
      fileName,
      fileSize,
      relativePath,
      encrypted: false,
      createOn: null,
      CreateNewIfExist: false,
    },
  );
  if (!sessionDebugLogged) {
    sessionDebugLogged = true;
    logger.debug(`startSession payload sample: ${JSON.stringify(payload)}`);
  }
  const id = extractSessionId(payload);
  if (!id) {
    throw new Error(
      `startSession: missing session id (payload=${JSON.stringify(payload)})`,
    );
  }
  return id;
};

const uploadFile = async (
  roomId: number,
  sessionId: string,
  fileName: string,
  buffer: Buffer,
): Promise<void> => {
  // Use createRequest only to build a Request carrying our cookies/auth — then
  // rebuild it with FormData as the body so fetch can attach the multipart
  // boundary itself.
  const [authReq] = await createRequest(
    [`/files/${roomId}/session/${sessionId}`],
    [],
    "POST",
  );

  const headers = new Headers(authReq.headers);
  headers.delete("content-type");

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: "application/octet-stream" }),
    fileName,
  );

  const res = await fetch(authReq.url, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`uploadFile failed: ${res.status} ${text}`);
  }
};

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      // Push a 4KB padding header to defeat reverse-proxy / Next dev-server
      // response buffering — many proxies hold small chunked responses until
      // they accumulate enough bytes. Lines starting with "#" are skipped by
      // the client parser.
      controller.enqueue(encoder.encode(`#${" ".repeat(4096)}\n`));

      try {
        const room = await callJsonApi<CreatedRoom>("/files/rooms", "POST", {
          title: LIBRARY_ROOM_TITLE,
          roomType: RoomsType.CustomRoom,
        });
        logger.debug(`Created AI Forms Library room ${room.id}`);
        send({ type: "room", roomId: room.id });

        const zipPath = path.join(process.cwd(), LIBRARY_ZIP_FILENAME);
        if (!fs.existsSync(zipPath)) {
          logger.warn(`AI Forms library archive not found at ${zipPath}`);
          send({
            type: "error",
            message: `${LIBRARY_ZIP_FILENAME} not found`,
            roomId: room.id,
          });
          controller.close();
          return;
        }

        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries().filter((e) => {
          if (e.isDirectory) return false;
          const name = e.entryName.replace(/\\/g, "/");
          // Skip macOS resource-fork metadata bundled by Finder's zip:
          // - "__MACOSX/" folder with AppleDouble copies of every file
          // - "._<filename>" sidecar files
          // - ".DS_Store" Finder index files
          if (name.startsWith("__MACOSX/") || name.includes("/__MACOSX/")) {
            return false;
          }
          const base = name.slice(name.lastIndexOf("/") + 1);
          if (base.startsWith("._") || base === ".DS_Store") return false;
          return true;
        });

        // If every entry is wrapped in a single top-level directory (the
        // archive was zipped from a folder), strip that wrapper so the room
        // contains the inner folders directly instead of library/China/.
        const normalizedNames = entries.map((e) =>
          e.entryName.replace(/\\/g, "/"),
        );
        const firstSegments = new Set(
          normalizedNames
            .map((n) => n.split("/")[0])
            .filter((seg) => seg.length > 0),
        );
        const hasRootFile = normalizedNames.some((n) => !n.includes("/"));
        const stripPrefix =
          !hasRootFile && firstSegments.size === 1
            ? `${[...firstSegments][0]}/`
            : "";

        const total = entries.length;
        logger.debug(
          `Library archive: ${total} files to upload to room ${room.id} (stripPrefix="${stripPrefix}")`,
        );
        send({ type: "start", total });

        let uploaded = 0;
        const failures: { path: string; error: string }[] = [];

        for (const entry of entries) {
          let fullPath = entry.entryName.replace(/\\/g, "/");
          if (stripPrefix && fullPath.startsWith(stripPrefix)) {
            fullPath = fullPath.slice(stripPrefix.length);
          }
          const lastSlash = fullPath.lastIndexOf("/");
          const fileName =
            lastSlash >= 0 ? fullPath.slice(lastSlash + 1) : fullPath;
          const relativePath =
            lastSlash >= 0 ? fullPath.slice(0, lastSlash) : "";

          try {
            const buffer = entry.getData();
            const sessionId = await startSession(
              room.id,
              fileName,
              buffer.byteLength,
              relativePath,
            );
            await uploadFile(room.id, sessionId, fileName, buffer);
            uploaded += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            failures.push({ path: fullPath, error: message });
            logger.error(`Library upload failed for "${fullPath}": ${message}`);
          }
          send({ type: "progress", uploaded, total });
        }

        logger.debug(
          `Uploaded ${uploaded}/${total} library files to room ${room.id}` +
            (failures.length ? ` (${failures.length} failures)` : ""),
        );
        send({
          type: "done",
          libraryId: room.id,
          uploaded,
          total,
          failures: failures.length,
        });
        controller.close();
      } catch (err) {
        logger.error(`AI Forms library provisioning failed: ${String(err)}`);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
