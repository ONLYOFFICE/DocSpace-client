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

import { frameCallCommand } from "@docspace/shared/utils/common";

const EXTERNAL_DATA_RETURN_TYPE = "onExternalDataReturn";
const PROBE_KEY = "__aiforms_probe__";
const DEFAULT_TIMEOUT_MS = 5000;
const PROBE_TIMEOUT_MS = 1500;

type PendingEntry = {
  resolve: (result: { received: boolean; value: unknown }) => void;
  timer: ReturnType<typeof setTimeout>;
};

let nextCallId = 1;
const pending = new Map<number, PendingEntry>();
let listenerInstalled = false;
let availabilityCache: Promise<boolean> | null = null;

const isInIframe = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.parent;
  } catch {
    return false;
  }
};

const onMessage = (e: MessageEvent) => {
  if (typeof window === "undefined") return;
  if (e.source !== window.parent) return;

  let payload: { type?: string; callId?: unknown; data?: unknown } | null = null;
  try {
    payload = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
  } catch {
    return;
  }

  if (!payload || payload.type !== EXTERNAL_DATA_RETURN_TYPE) return;
  if (typeof payload.callId !== "number") return;

  const entry = pending.get(payload.callId);
  if (!entry) return;

  pending.delete(payload.callId);
  clearTimeout(entry.timer);
  entry.resolve({ received: true, value: payload.data });
};

const installListener = () => {
  if (listenerInstalled) return;
  if (typeof window === "undefined") return;

  window.addEventListener("message", onMessage, false);
  listenerInstalled = true;
};

const requestExternalData = (
  key: string,
  timeoutMs: number,
): Promise<{ received: boolean; value: unknown }> => {
  if (!isInIframe()) {
    return Promise.resolve({ received: false, value: null });
  }

  installListener();

  return new Promise((resolve) => {
    const callId = nextCallId++;

    const timer = setTimeout(() => {
      pending.delete(callId);
      resolve({ received: false, value: null });
    }, timeoutMs);

    pending.set(callId, { resolve, timer });

    try {
      frameCallCommand("getExternalData", { key, callId });
    } catch {
      pending.delete(callId);
      clearTimeout(timer);
      resolve({ received: false, value: null });
    }
  });
};

export const externalStorageGet = async <T = unknown>(
  key: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T | null> => {
  const result = await requestExternalData(key, timeoutMs);
  if (!result.received) return null;
  return (result.value ?? null) as T | null;
};

export const externalStorageSet = (
  key: string,
  value: unknown,
): Promise<void> => {
  if (!isInIframe()) return Promise.resolve();

  try {
    frameCallCommand("setExternalData", { key, value });
  } catch {
    /* noop */
  }
  return Promise.resolve();
};

export const isExternalStorageAvailable = (): Promise<boolean> => {
  if (availabilityCache !== null) return availabilityCache;
  if (!isInIframe()) {
    availabilityCache = Promise.resolve(false);
    return availabilityCache;
  }

  availabilityCache = requestExternalData(PROBE_KEY, PROBE_TIMEOUT_MS).then(
    (r) => r.received,
  );
  return availabilityCache;
};

export const __resetExternalStorageForTests = () => {
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
  }
  pending.clear();
  availabilityCache = null;
  nextCallId = 1;
  if (listenerInstalled && typeof window !== "undefined") {
    window.removeEventListener("message", onMessage, false);
    listenerInstalled = false;
  }
};
