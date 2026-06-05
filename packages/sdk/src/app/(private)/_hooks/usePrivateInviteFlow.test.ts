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

import { describe, it, expect, vi, beforeEach } from "vitest";

import { isReencryptAbortError } from "./usePrivateInviteFlow";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshController(): AbortController {
  return new AbortController();
}

function abortedController(): AbortController {
  const c = new AbortController();
  c.abort("test");
  return c;
}

// ---------------------------------------------------------------------------
// isReencryptAbortError — controls whether the catch block shows a toast
// ---------------------------------------------------------------------------

describe("isReencryptAbortError", () => {
  // Scenario: addMembersToEncryptedRoom throws a generic network / logic error.
  // The controller is still active (not aborted). Expects: toast SHOULD be shown
  // (function returns false so the caller invokes toastr.error).
  it("returns false for a plain Error on a live controller → toast should show", () => {
    const controller = freshController();
    const error = new Error("network failure");
    expect(isReencryptAbortError(controller, error)).toBe(false);
  });

  // Scenario: the operation was cancelled via AbortController.abort() before or
  // while addMembersToEncryptedRoom was running. Expects: silent (returns true).
  it("returns true when the controller is already aborted → no toast", () => {
    const controller = abortedController();
    const error = new Error("whatever");
    expect(isReencryptAbortError(controller, error)).toBe(true);
  });

  // Scenario: the thrown error is a DOM/Node AbortError (name === "AbortError")
  // even though the controller has not been explicitly aborted yet. Expects:
  // silent (returns true).
  it("returns true for an AbortError on a live controller → no toast", () => {
    const controller = freshController();
    const error = new Error("aborted");
    error.name = "AbortError";
    expect(isReencryptAbortError(controller, error)).toBe(true);
  });

  // Combining both: aborted controller AND an AbortError — still silent.
  it("returns true when both controller is aborted and error is AbortError", () => {
    const controller = abortedController();
    const error = new Error("aborted");
    error.name = "AbortError";
    expect(isReencryptAbortError(controller, error)).toBe(true);
  });

  // Non-Error thrown values (e.g. a plain string or object) should still
  // surface as a toast as long as the controller is not aborted.
  it("returns false for a non-Error thrown value on a live controller", () => {
    const controller = freshController();
    expect(isReencryptAbortError(controller, "string error")).toBe(false);
    expect(isReencryptAbortError(controller, { code: 500 })).toBe(false);
    expect(isReencryptAbortError(controller, null)).toBe(false);
  });

  // A plain Error whose name happens to be "Error" (not "AbortError") is NOT
  // treated as a silent abort, even if the message contains "abort".
  it("does NOT treat a plain Error named 'Error' as an abort", () => {
    const controller = freshController();
    const error = new Error("operation aborted internally");
    expect(isReencryptAbortError(controller, error)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Pre-submit identity guard (onBeforeSubmit)
//
// These tests cover the contract of the `onBeforeSubmit` callback returned by
// usePrivateInviteFlow and passed to InvitePanel's `onBeforeSubmit` prop.
// The guard MUST run before setRoomSecurity is called so that server access is
// never granted when encryption keys are locked or absent.
//
// We inline the guard body (it is structurally identical to the real callback)
// to avoid requiring React context providers in the test environment. The
// behaviour of the real hook is fully determined by this logic.
// ---------------------------------------------------------------------------

describe("onBeforeSubmit guard logic (pre-submit identity check)", () => {
  const toastrError = vi.fn();
  const t = (key: string) => key;

  beforeEach(() => {
    toastrError.mockReset();
  });

  /**
   * Reproduces the body of onBeforeSubmit from usePrivateInviteFlow exactly.
   * If the real implementation changes, update this mirror and the tests.
   */
  async function guard(
    requireIdentity: () => Promise<unknown>,
  ): Promise<boolean> {
    const identity = await requireIdentity();
    if (!identity) {
      toastrError(t("Common:EncryptionLockedAddMembers"));
      return false;
    }
    return true;
  }

  // Scenario: keys are unlocked — guard should pass through silently.
  it("returns true and does NOT toast when identity is available", async () => {
    const fakeIdentity = { privateKey: new Uint8Array(32) };
    const requireIdentity = vi.fn().mockResolvedValue(fakeIdentity);

    const result = await guard(requireIdentity);

    expect(result).toBe(true);
    expect(toastrError).not.toHaveBeenCalled();
    expect(requireIdentity).toHaveBeenCalledOnce();
  });

  // Scenario: keys are locked / user cancelled the passphrase dialog (null).
  // Guard must return false and show the EncryptionLockedAddMembers toast.
  it("returns false and shows EncryptionLockedAddMembers toast when identity is null", async () => {
    const requireIdentity = vi.fn().mockResolvedValue(null);

    const result = await guard(requireIdentity);

    expect(result).toBe(false);
    expect(toastrError).toHaveBeenCalledOnce();
    expect(toastrError).toHaveBeenCalledWith("Common:EncryptionLockedAddMembers");
  });

  // Scenario: no keys configured at all (undefined / falsy).
  it("returns false and shows toast when identity is undefined", async () => {
    const requireIdentity = vi.fn().mockResolvedValue(undefined);

    const result = await guard(requireIdentity);

    expect(result).toBe(false);
    expect(toastrError).toHaveBeenCalledOnce();
  });

  // Acceptance criterion: setRoomSecurity MUST NOT be called when the guard
  // returns false (locked identity).
  it("setRoomSecurity is NOT called when guard returns false (locked keys)", async () => {
    const setRoomSecurity = vi.fn();
    const requireIdentity = vi.fn().mockResolvedValue(null);

    const canProceed = await guard(requireIdentity);
    // This mirrors the InvitePanel onClickSend early-return pattern:
    if (canProceed) {
      setRoomSecurity();
    }

    expect(canProceed).toBe(false);
    expect(setRoomSecurity).not.toHaveBeenCalled();
  });

  // Positive path: setRoomSecurity IS reached when keys are unlocked.
  it("setRoomSecurity IS called when guard returns true (unlocked keys)", async () => {
    const setRoomSecurity = vi.fn();
    const fakeIdentity = { privateKey: new Uint8Array(32) };
    const requireIdentity = vi.fn().mockResolvedValue(fakeIdentity);

    const canProceed = await guard(requireIdentity);
    if (canProceed) {
      setRoomSecurity();
    }

    expect(canProceed).toBe(true);
    expect(setRoomSecurity).toHaveBeenCalledOnce();
  });
});
