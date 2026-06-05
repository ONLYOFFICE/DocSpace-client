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
 * Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Pure logic extracted from useTrashActions: immediately flag computation.
//
// The hook computes:
//   const immediately = isTrash || !!encryptedActions;
//
// This mirrors the reference-client pattern in FilesActionsStore.js:
//   immediately = !!(isRecycleBinFolder || isPrivacyFolder)
//
// Contract:
//  - Trash folder     → immediately=true  (permanent delete, no extra bin step)
//  - Private room     → immediately=true  (bypass recycle bin for E2EE files)
//  - Normal folder    → immediately=false (items go to recycle bin as usual)
//  - Both flags true  → immediately=true
// ---------------------------------------------------------------------------

function computeImmediately(
  isTrash: boolean,
  encryptedActions: object | null,
): boolean {
  return isTrash || !!encryptedActions;
}

const FAKE_ENCRYPTED_ACTIONS = {
  downloadFile: async () => {},
  downloadZip: async () => {},
  duplicateFile: async () => {},
  copyFiles: async () => {},
  moveFiles: async () => {},
};

describe("useTrashActions — immediately flag", () => {
  it("is false in a normal (non-trash, non-private) folder", () => {
    expect(computeImmediately(false, null)).toBe(false);
  });

  it("is true when the current folder is the trash", () => {
    expect(computeImmediately(true, null)).toBe(true);
  });

  it("is true when encryptedActions is non-null (private room context)", () => {
    expect(computeImmediately(false, FAKE_ENCRYPTED_ACTIONS)).toBe(true);
  });

  it("is true when both isTrash and encryptedActions are set", () => {
    expect(computeImmediately(true, FAKE_ENCRYPTED_ACTIONS)).toBe(true);
  });

  it("is false when encryptedActions is explicitly null (no provider mounted)", () => {
    expect(computeImmediately(false, null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cache-cleanup contract: forgetEncryptedFilename must be called for every
// deleted FILE id when encryptedActions is non-null.
//
// The hook runs:
//   if (encryptedActions) {
//     fileIds.forEach((id) => forgetEncryptedFilename(id));
//   }
//
// This mirrors FilesActionsStore.js:599:
//   fileIds.forEach((id) => forgetEncryptedFilename(id));
//
// Contract:
//  - Private context  → forgetEncryptedFilename called once per file id
//  - No file ids      → forgetEncryptedFilename never called
//  - Non-private ctx  → forgetEncryptedFilename never called (null provider)
//  - Folder-only del  → forgetEncryptedFilename never called (no file ids)
// ---------------------------------------------------------------------------

function simulateCacheCleanup(
  fileIds: number[],
  encryptedActions: object | null,
  forget: (id: number) => void,
): void {
  if (encryptedActions) {
    fileIds.forEach((id) => forget(id));
  }
}

describe("useTrashActions — filename cache cleanup on delete", () => {
  let forget: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    forget = vi.fn();
  });

  it("calls forgetEncryptedFilename for each file id in a private context", () => {
    simulateCacheCleanup([1, 2, 3], FAKE_ENCRYPTED_ACTIONS, forget);
    expect(forget).toHaveBeenCalledTimes(3);
    expect(forget).toHaveBeenCalledWith(1);
    expect(forget).toHaveBeenCalledWith(2);
    expect(forget).toHaveBeenCalledWith(3);
  });

  it("does not call forgetEncryptedFilename when encryptedActions is null", () => {
    simulateCacheCleanup([1, 2, 3], null, forget);
    expect(forget).not.toHaveBeenCalled();
  });

  it("does not call forgetEncryptedFilename when file ids list is empty", () => {
    simulateCacheCleanup([], FAKE_ENCRYPTED_ACTIONS, forget);
    expect(forget).not.toHaveBeenCalled();
  });

  it("does not call forgetEncryptedFilename for folder-only deletes (no file ids)", () => {
    // Folders are not files — fileIds is empty when only folders are selected.
    simulateCacheCleanup([], FAKE_ENCRYPTED_ACTIONS, forget);
    expect(forget).not.toHaveBeenCalled();
  });

  it("calls forgetEncryptedFilename exactly once for a single file delete", () => {
    simulateCacheCleanup([42], FAKE_ENCRYPTED_ACTIONS, forget);
    expect(forget).toHaveBeenCalledTimes(1);
    expect(forget).toHaveBeenCalledWith(42);
  });

  it("passes each id as a standalone argument (not an array)", () => {
    simulateCacheCleanup([10, 20], FAKE_ENCRYPTED_ACTIONS, forget);
    // Each call receives a single number, not an array — matches the
    // forgetEncryptedFilename(fileId: number | string) signature.
    for (const call of forget.mock.calls) {
      expect(call).toHaveLength(1);
      expect(typeof call[0]).toBe("number");
    }
  });
});
