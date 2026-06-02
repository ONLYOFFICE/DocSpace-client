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

import { describe, it, expect } from "vitest";

import { AVAILABLE_CONTEXT_ITEMS as C } from "@/app/(docspace)/_enums/context-items";

import {
  PRIVATE_FILE_CONTEXT_OPTIONS,
  PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS,
} from "./usePrivateRoomContextMenu";

// These tests assert *contracts*, not the literal current contents of the
// whitelist:
//  - SECURITY contract — actions that would break end-to-end encryption or
//    leak plaintext must never be reachable on an encrypted file. Each maps to
//    a non-scope decision in SDK_PRIVATE_PLAN.md §2. Adding one to the
//    whitelist fails the suite, forcing a deliberate security review.
//  - FUNCTIONALITY contract — actions the feature genuinely needs to be usable.
//    Removing one breaks the feature and fails the suite.
//
// We intentionally do NOT pin the exact membership (e.g. rename / copy / move
// are flagged for possible removal in the plan's open-UI-gaps backlog), so the
// tests don't enshrine assumptions that legitimate product decisions would
// have to fight.

// Must NEVER be offered on an encrypted file (E2EE would break or the action
// is meaningless without server-side plaintext).
const FORBIDDEN = [
  C.share, // external / public sharing — deferred to v2
  C.copyLink, // room-member link is still an external surface
  C.downloadAs, // server-side conversion destroys the ciphertext
  C.fillForm, // forms flow — out of scope
  C.edit, // the editor cannot decrypt yet (full isolation, §2)
  C.editPDF,
  C.showVersionHistory, // versioning needs per-version key rotation
  C.blockUnblockVersion,
  C.customFilter,
  C.vectorization, // the LLM has no access to keys
  C.markAsFavorite, // server silently ignores favorites on encrypted files
  C.removeFromFavorites,
  C.deletePermanently, // trash / restore is deferred in v1
  C.restore,
] as const;

describe("private-room context-menu whitelist", () => {
  describe("PRIVATE_FILE_CONTEXT_OPTIONS (active rooms)", () => {
    it.each([...FORBIDDEN])(
      "never exposes the forbidden action '%s'",
      (action) => {
        expect(PRIVATE_FILE_CONTEXT_OPTIONS.has(action)).toBe(false);
      },
    );

    // Without these the room is unusable: you cannot get a file out of it
    // (download), manage it (delete), or open the members / details panel
    // (showInfo). These are stable and not on any removal track.
    it.each([C.download, C.delete, C.showInfo])(
      "keeps the required action '%s' available",
      (action) => {
        expect(PRIVATE_FILE_CONTEXT_OPTIONS.has(action)).toBe(true);
      },
    );
  });

  describe("PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS (archived rooms)", () => {
    it("never exposes any forbidden action either", () => {
      for (const action of FORBIDDEN) {
        expect(PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS.has(action)).toBe(false);
      }
    });

    it("is a subset of the active-room whitelist (archive is never broader)", () => {
      for (const action of PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS) {
        expect(PRIVATE_FILE_CONTEXT_OPTIONS.has(action)).toBe(true);
      }
    });

    // Archived rooms are cold storage: inspect and remove, never mutate in
    // place. A mutating action leaking in would let users edit a room that the
    // UI presents as read-only.
    it.each([C.rename, C.copy, C.duplicate, C.moveTo])(
      "forbids the mutating action '%s'",
      (action) => {
        expect(PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS.has(action)).toBe(false);
      },
    );

    it("still allows download and delete (the point of an archive view)", () => {
      expect(PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS.has(C.download)).toBe(true);
      expect(PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS.has(C.delete)).toBe(true);
    });
  });
});
