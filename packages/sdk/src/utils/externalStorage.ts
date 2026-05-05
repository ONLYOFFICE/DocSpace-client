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
