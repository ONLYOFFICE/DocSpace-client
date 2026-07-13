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

// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { frameCallCommand } from "./common";

const AUTH_TOKEN_RETURN_TYPE = "onAuthTokenReturn";

export const AUTH_TOKEN_TIMEOUT_MS = 10000;

type PendingEntry = {
  resolve: (token: string | null) => void;
  timer: ReturnType<typeof setTimeout>;
};

let nextCallId = 1;
const pending = new Map<number, PendingEntry>();
let listenerInstalled = false;

const isInIframe = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.parent;
  } catch {
    return false;
  }
};

let latchedFromUrl: boolean | null = null;

export const isOAuthFrame = (): boolean => {
  if (typeof window === "undefined") return false;

  if (!isInIframe()) return false;

  const cfg = window.ClientConfig;
  if (cfg?.isOAuthFrame != null) return cfg.isOAuthFrame;
  if (latchedFromUrl != null) return latchedFromUrl;

  const fromUrl =
    new URLSearchParams(window.location.search).get("auth") === "oauth";
  latchedFromUrl = fromUrl;
  if (cfg) cfg.isOAuthFrame = fromUrl;
  return fromUrl;
};

const getExpectedHostOrigin = (): string | null => {
  try {
    const ancestors = window.location.ancestorOrigins as
      | DOMStringList
      | undefined;
    if (ancestors && ancestors.length > 0) return ancestors[0];
    if (document.referrer) return new URL(document.referrer).origin;
  } catch {
    return null;
  }
  return null;
};

const onMessage = (e: MessageEvent) => {
  if (typeof window === "undefined") return;
  if (e.source !== window.parent) return;

  const expected = getExpectedHostOrigin();
  if (!expected) {
    console.warn(
      "[OAuth] cannot validate message origin — ancestorOrigins and referrer unavailable",
    );
  } else if (e.origin !== expected) {
    return;
  }

  let payload:
    | { type?: string; callId?: unknown; data?: { accessToken?: unknown } }
    | null = null;
  try {
    payload = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
  } catch {
    return;
  }

  if (!payload || payload.type !== AUTH_TOKEN_RETURN_TYPE) return;
  if (typeof payload.callId !== "number") return;

  const entry = pending.get(payload.callId);
  if (!entry) return;

  pending.delete(payload.callId);
  clearTimeout(entry.timer);

  const token = payload.data?.accessToken;
  entry.resolve(typeof token === "string" ? token : null);
};

const installListener = () => {
  if (listenerInstalled) return;
  if (typeof window === "undefined") return;
  window.addEventListener("message", onMessage, false);
  listenerInstalled = true;
};

export const requestAuthToken = (
  timeoutMs: number = AUTH_TOKEN_TIMEOUT_MS,
): Promise<string | null> => {
  if (!isInIframe()) return Promise.resolve(null);

  installListener();

  return new Promise((resolve) => {
    const callId = nextCallId;
    nextCallId += 1;

    const timer = setTimeout(() => {
      pending.delete(callId);
      resolve(null);
    }, timeoutMs);

    pending.set(callId, { resolve, timer });

    try {
      frameCallCommand("getAuthToken", { callId });
    } catch {
      pending.delete(callId);
      clearTimeout(timer);
      resolve(null);
    }
  });
};

export const __resetOAuthTokenForTests = () => {
  pending.forEach((entry) => clearTimeout(entry.timer));
  pending.clear();
  nextCallId = 1;
  latchedFromUrl = null;
  if (listenerInstalled && typeof window !== "undefined") {
    window.removeEventListener("message", onMessage, false);
    listenerInstalled = false;
  }
};
