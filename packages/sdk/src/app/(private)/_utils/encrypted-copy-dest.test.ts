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
import { RoomsType } from "@docspace/shared/enums";
import type { TGetFolder } from "@docspace/shared/api/files/types";

import { resolveEncryptedCopyDest } from "./encrypted-copy-dest";

// Minimal fixture: resolveEncryptedCopyDest only reads current.{private,
// roomType,id} and pathParts[].id, so we build just those and cast.
type DestFixture = {
  current?: { id?: number; private?: boolean; roomType?: RoomsType };
  pathParts?: Array<{ id: number }>;
};
const dest = (f: DestFixture): TGetFolder => f as unknown as TGetFolder;

describe("resolveEncryptedCopyDest", () => {
  it("allows a private room destination and resolves it to the room id", () => {
    const result = resolveEncryptedCopyDest(
      dest({ current: { id: 7, private: true, roomType: RoomsType.CustomRoom } }),
    );
    expect(result).toEqual({ mode: "re-encrypt", roomId: 7 });
  });

  it("allows a subfolder of a private room, resolving to the owning room (pathParts[1])", () => {
    // A subfolder carries no roomType; the room is the 2nd path segment.
    const result = resolveEncryptedCopyDest(
      dest({
        current: { id: 99, private: true },
        pathParts: [{ id: 1 }, { id: 7 }, { id: 99 }],
      }),
    );
    expect(result).toEqual({ mode: "re-encrypt", roomId: 7 });
  });

  it("prefers the room's own id over the path when the destination IS a room", () => {
    // Guards against a regression that always reads pathParts[1]: a room-level
    // destination must resolve to current.id, not the path.
    const result = resolveEncryptedCopyDest(
      dest({
        current: { id: 7, private: true, roomType: RoomsType.CustomRoom },
        pathParts: [{ id: 1 }, { id: 999 }],
      }),
    );
    expect(result).toEqual({ mode: "re-encrypt", roomId: 7 });
  });

  it("returns plaintext mode for a non-private destination (decrypt-and-copy-out)", () => {
    const result = resolveEncryptedCopyDest(
      dest({
        current: { id: 7, private: false, roomType: RoomsType.CustomRoom },
        pathParts: [{ id: 1 }, { id: 7 }],
      }),
    );
    expect(result).toEqual({ mode: "plaintext" });
  });

  it("blocks when the destination is private but the room cannot be resolved", () => {
    const result = resolveEncryptedCopyDest(
      dest({ current: { id: 99, private: true }, pathParts: [{ id: 1 }] }),
    );
    expect(result).toEqual({ mode: "blocked", reason: "unresolved-room" });
  });

  it("blocks when the destination folder is unknown (fail closed)", () => {
    const result = resolveEncryptedCopyDest(
      dest({ pathParts: [{ id: 1 }, { id: 7 }] }),
    );
    expect(result).toEqual({ mode: "blocked", reason: "unresolved-room" });
  });
});
