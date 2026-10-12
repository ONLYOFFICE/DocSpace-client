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

import { NoAccessError, AuthenticationError } from "./errors";

const SESSION_KEY = "encryption-ghost-state-notified";

type GhostStateHandler = () => void;
let registeredHandler: GhostStateHandler | null = null;

/**
 * Register a UI callback for the ghost-state event. Called once per session
 * across all unwrap call sites; sessionStorage gate prevents toast spam
 * when bulk operations hit the same wall.
 *
 * The handler is plain — no React or i18n deps in this module. The host
 * (e.g. EncryptionProviderWrapper) wires up a toastr-driven implementation.
 */
export const registerGhostStateHandler = (handler: GhostStateHandler) => {
  registeredHandler = handler;
};

export const clearGhostStateHandler = () => {
  registeredHandler = null;
};

/**
 * Reset the session gate. Call this after a successful identity unlock/reset
 * so a subsequent failure surfaces the toast again.
 */
export const resetGhostStateGate = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage can throw in private-mode Safari; ignore.
  }
};

/**
 * Inspect an error from any unwrap call site and fire the registered handler
 * iff the error indicates ghost state AND we haven't surfaced the toast yet
 * in this session.
 */
export const reportPotentialGhostState = (error: unknown): void => {
  if (
    !(error instanceof NoAccessError) &&
    !(error instanceof AuthenticationError)
  ) {
    return;
  }
  if (!registeredHandler) return;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // If storage is unavailable, fire anyway — better one extra toast than
    // silence, but accept the duplicate-toast risk.
  }
  try {
    registeredHandler();
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: surface handler bugs in dev; production build strips console.
    console.error("[ghost-state] handler threw:", e);
  }
};
