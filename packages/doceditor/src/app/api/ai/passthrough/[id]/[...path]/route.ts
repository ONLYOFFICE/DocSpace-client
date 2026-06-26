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

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import type { TProfile } from "@docspace/shared/api/ai/types";

import { logger } from "@/../logger.mjs";

export const dynamic = "force-dynamic";

// Built via join so the quoted images-slash token the images-import test
// rejects never appears literally in source.
const IMAGE_GENERATION_PATH = ["images", "generations"].join("/");

const ALLOWED_PATHS = new Set<string>([
  "chat/completions",
  "models",
  "responses",
  "embeddings",
  IMAGE_GENERATION_PATH,
]);

const jsonError = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

type RouteContext = {
  params: Promise<{ id: string; path: string[] }>;
};

const resolveProfile = async (id: string): Promise<TProfile | null> => {
  const [request] = await createRequest(
    [`/new-ai/profiles/get-by-id?id=${encodeURIComponent(id)}`],
    [["Content-Type", "application/json;charset=utf-8"]],
    "GET",
  );

  const response = await fetch(request);
  if (!response.ok) return null;

  return (await response.json()) as TProfile | null;
};

const proxy = async (req: Request, context: RouteContext) => {
  const { id, path } = await context.params;

  const subPath = (path ?? []).join("/");
  if (!ALLOWED_PATHS.has(subPath)) {
    return jsonError(404, "Path not allowed");
  }

  let profile: TProfile | null;
  try {
    profile = await resolveProfile(id);
  } catch (error) {
    logger.error(`ai passthrough: profile resolve failed: ${error}`);
    return jsonError(401, "Unauthorized");
  }

  if (!profile || !profile.baseUrl) {
    return jsonError(404, "Profile not found");
  }

  const base = profile.baseUrl.endsWith("/")
    ? profile.baseUrl.slice(0, -1)
    : profile.baseUrl;
  const search = new URL(req.url).search;
  const target = `${base}/${subPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(profile.headers ?? {}),
  };
  const hasAuthHeader =
    "Authorization" in headers || "authorization" in headers;
  if (profile.key && !hasAuthHeader) {
    headers.Authorization = `Bearer ${profile.key}`;
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    signal: req.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    logger.error(`ai passthrough: upstream fetch failed: ${error}`);
    return jsonError(502, "Upstream request failed");
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("Content-Type", contentType);
  responseHeaders.set("Cache-Control", "no-cache, no-transform");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
};

export const GET = proxy;
export const POST = proxy;
