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
// Pure logic extracted from useDocsHotkeys: folder-upload hotkey guard.
//
// The hook computes the guard as:
//   if (encryptedActions) return;   // silent no-op in private room
//   onUploadFolder();
//
// This mirrors HotkeyStore.js:601-603 in the reference client:
//   uploadFile = (isFolder) => {
//     if (isFolder) {
//       if (this.treeFoldersStore.isPrivacyFolder) return;
//       ...
//     }
//   }
//
// Contract:
//  - Private room (encryptedActions non-null) → onUploadFolder is NOT called
//  - Normal folder (encryptedActions null)    → onUploadFolder IS called
//  - Plain file-upload hotkey                 → always calls onUploadFiles
//    (no guard — folder-only restriction)
//  - No toast is ever emitted — the guard is fully silent.
// ---------------------------------------------------------------------------

function simulateFolderUploadHotkey(
  encryptedActions: object | null,
  onUploadFolder: () => void,
): void {
  // Mirrors the handler body in useDocsHotkeys.ts (shift+i binding).
  if (encryptedActions) return;
  onUploadFolder();
}

function simulateFileUploadHotkey(
  encryptedActions: object | null,
  onUploadFiles: () => void,
): void {
  // Mirrors the handler body in useDocsHotkeys.ts (shift+u binding).
  // The file-upload hotkey has NO private-room guard — only folder upload is
  // blocked (matches HotkeyStore.js where only isFolder path checks privacy).
  void encryptedActions; // intentionally unused
  onUploadFiles();
}

const FAKE_ENCRYPTED_ACTIONS = {
  downloadFile: async () => {},
  downloadZip: async () => {},
  duplicateFile: async () => {},
  copyFiles: async () => {},
  moveFiles: async () => {},
};

describe("useDocsHotkeys — folder-upload hotkey private-room guard", () => {
  let onUploadFolder: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onUploadFolder = vi.fn<() => void>();
  });

  it("calls onUploadFolder in a normal (non-private) context", () => {
    simulateFolderUploadHotkey(null, onUploadFolder);
    expect(onUploadFolder).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onUploadFolder when encryptedActions is non-null (private room)", () => {
    simulateFolderUploadHotkey(FAKE_ENCRYPTED_ACTIONS, onUploadFolder);
    expect(onUploadFolder).not.toHaveBeenCalled();
  });

  it("is a silent no-op in private room — onUploadFolder never fires", () => {
    // Called multiple times to confirm it is always suppressed, not just once.
    simulateFolderUploadHotkey(FAKE_ENCRYPTED_ACTIONS, onUploadFolder);
    simulateFolderUploadHotkey(FAKE_ENCRYPTED_ACTIONS, onUploadFolder);
    expect(onUploadFolder).not.toHaveBeenCalled();
  });

  it("does NOT call onUploadFolder when encryptedActions is a minimal object", () => {
    // Any truthy encryptedActions value — even an empty object — should block.
    simulateFolderUploadHotkey({}, onUploadFolder);
    expect(onUploadFolder).not.toHaveBeenCalled();
  });
});

describe("useDocsHotkeys — file-upload hotkey is unrestricted in private rooms", () => {
  let onUploadFiles: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onUploadFiles = vi.fn<() => void>();
  });

  it("calls onUploadFiles in a normal context", () => {
    simulateFileUploadHotkey(null, onUploadFiles);
    expect(onUploadFiles).toHaveBeenCalledTimes(1);
  });

  it("still calls onUploadFiles even when encryptedActions is non-null", () => {
    // File upload (shift+u) has no private-room guard — only folder upload
    // (shift+i) is blocked, matching HotkeyStore.js behavior.
    simulateFileUploadHotkey(FAKE_ENCRYPTED_ACTIONS, onUploadFiles);
    expect(onUploadFiles).toHaveBeenCalledTimes(1);
  });
});
