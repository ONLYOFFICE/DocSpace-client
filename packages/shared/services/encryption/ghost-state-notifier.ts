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
    console.error("[ghost-state] handler threw:", e);
  }
};
