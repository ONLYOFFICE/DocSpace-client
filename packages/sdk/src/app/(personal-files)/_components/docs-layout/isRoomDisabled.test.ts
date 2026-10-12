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

// ---------------------------------------------------------------------------
// Pure predicate extracted from DocsLayout: the isRoomDisabled callback
// passed to FilesSelector when rendering the copy/move destination selector.
//
// Reference: packages/client/src/components/FilesSelector/index.tsx:545-550
//
// Logic:
//   !isPrivate (non-private source)
//     → (room) => room?.private === true   [disable private rooms]
//   isPrivate (private-room source)
//     → undefined                          [allow all destinations;
//                                           resolveEncryptedCopyDest governs]
//
// Contract:
//  - Non-private source + private room   → disabled (true)
//  - Non-private source + normal room    → enabled  (false)
//  - Non-private source + null/undefined → enabled  (false) — fail open
//  - Private source                      → predicate is undefined
// ---------------------------------------------------------------------------

type RoomLike = { private?: boolean } | null | undefined;

/**
 * Returns the isRoomDisabled predicate for the given source context.
 * Mirrors the JSX expression in DocsLayout.
 */
function buildIsRoomDisabled(
  isPrivate: boolean | undefined,
): ((room: RoomLike) => boolean) | undefined {
  if (!isPrivate) {
    return (room: RoomLike) => room?.private === true;
  }
  return undefined;
}

describe("DocsLayout — isRoomDisabled predicate", () => {
  describe("non-private source context (isPrivate=false/undefined)", () => {
    for (const isPrivate of [false, undefined] as Array<boolean | undefined>) {
      describe(`isPrivate=${String(isPrivate)}`, () => {
        it("returns a function (not undefined)", () => {
          expect(typeof buildIsRoomDisabled(isPrivate)).toBe("function");
        });

        it("disables a room with private=true", () => {
          const predicate = buildIsRoomDisabled(isPrivate)!;
          expect(predicate({ private: true })).toBe(true);
        });

        it("enables a room with private=false", () => {
          const predicate = buildIsRoomDisabled(isPrivate)!;
          expect(predicate({ private: false })).toBe(false);
        });

        it("enables a room with no private property (normal room)", () => {
          const predicate = buildIsRoomDisabled(isPrivate)!;
          expect(predicate({})).toBe(false);
        });

        it("enables a null room (does not throw, fails open)", () => {
          const predicate = buildIsRoomDisabled(isPrivate)!;
          expect(predicate(null)).toBe(false);
        });

        it("enables an undefined room (does not throw, fails open)", () => {
          const predicate = buildIsRoomDisabled(isPrivate)!;
          expect(predicate(undefined)).toBe(false);
        });
      });
    }
  });

  describe("private source context (isPrivate=true) — private-to-private allowed", () => {
    it("returns undefined so FilesSelector applies no room-level filter", () => {
      expect(buildIsRoomDisabled(true)).toBeUndefined();
    });

    it("would NOT disable a private destination room (private→private path)", () => {
      // When isPrivate=true the predicate is undefined, meaning no rooms are
      // disabled at the selector level. Destination validation is handled by
      // resolveEncryptedCopyDest inside the encrypted copy/move hook.
      const predicate = buildIsRoomDisabled(true);
      expect(predicate).toBeUndefined();
    });
  });
});
