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

import { describe, it, expect } from "vitest";

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
