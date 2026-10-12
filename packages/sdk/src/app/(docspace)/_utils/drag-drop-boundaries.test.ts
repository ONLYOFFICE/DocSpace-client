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
 * This license applies only to their non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect } from "vitest";

import { FolderType } from "@docspace/shared/enums";

import {
  checkDragDropBoundaries,
  type DragSelectionItem,
  type DestFolderInfo,
} from "./drag-drop-boundaries";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const makeFile = (id: number): DragSelectionItem => ({
  isFolder: false,
  id,
});

const makeFolder = (id: number): DragSelectionItem => ({
  isFolder: true,
  id,
});

const privateDestInfo: DestFolderInfo = {
  private: true,
  rootFolderType: FolderType.Rooms,
};

const normalDestInfo: DestFolderInfo = {
  private: false,
  rootFolderType: FolderType.USER,
};

// Destination that is inside the Rooms container but has private=undefined/false
// (edge case — still a rooms subfolder type).
const roomsContainerDest: DestFolderInfo = {
  private: false,
  rootFolderType: FolderType.Rooms,
};

// ---------------------------------------------------------------------------
// Case 1: non-private source → private destination → hard block
//
// Reference: FilesActionsStore.js:2431-2434
//   if (isPrivateDestination && !sourceInPrivateRoom) {
//     toastr.error(i18n.t("Common:CannotTransferToPrivateRoom"));
//     return;
//   }
// ---------------------------------------------------------------------------

describe(
  "checkDragDropBoundaries — Case 1: non-private source → private dest",
  () => {
    it("blocks a single file dropped onto a private room", () => {
      const result = checkDragDropBoundaries(
        false,
        privateDestInfo,
        [makeFile(1)],
        99,
      );
      expect(result.kind).toBe("block-private-dest");
      if (result.kind === "block-private-dest") {
        expect(result.toastKey).toBe("Common:CannotTransferToPrivateRoom");
      }
    });

    it("blocks a single folder dropped onto a private room", () => {
      const result = checkDragDropBoundaries(
        false,
        privateDestInfo,
        [makeFolder(10)],
        99,
      );
      expect(result.kind).toBe("block-private-dest");
    });

    it("blocks a mixed selection (files + folders) dropped onto a private room", () => {
      const result = checkDragDropBoundaries(
        false,
        privateDestInfo,
        [makeFile(1), makeFile(2), makeFolder(10)],
        99,
      );
      expect(result.kind).toBe("block-private-dest");
    });

    it("blocks even an empty selection when destination is private", () => {
      const result = checkDragDropBoundaries(false, privateDestInfo, [], 99);
      expect(result.kind).toBe("block-private-dest");
    });

    it("blocks when destFolderInfo.private is true regardless of rootFolderType", () => {
      const result = checkDragDropBoundaries(
        false,
        { private: true, rootFolderType: FolderType.USER },
        [makeFile(1)],
        99,
      );
      expect(result.kind).toBe("block-private-dest");
    });
  },
);

// ---------------------------------------------------------------------------
// Case 2: private source → non-private destination
//
// Reference: FilesActionsStore.js:2436-2458
//   const files = dragSelection.filter((el) => !el.isFolder);
//   const hasFolders = dragSelection.some((el) => el.isFolder);
//   if (hasFolders) { toastr.error(CannotTransferFolderFromPrivateRoom); }
//   if (files.length > 0) { copyEncryptedFilesToFolder(files, ...); }
//   return;
//
// Mixed-selection nuance: folder error fires, but files in the same selection
// continue through the encrypted copy path.
// ---------------------------------------------------------------------------

describe(
  "checkDragDropBoundaries — Case 2: private source → non-private dest",
  () => {
    it("returns partial-private-source + folder toast when a folder is in the selection", () => {
      const result = checkDragDropBoundaries(
        true,
        normalDestInfo,
        [makeFolder(10)],
        99,
      );
      expect(result.kind).toBe("partial-private-source");
      if (result.kind === "partial-private-source") {
        expect(result.toastKey).toBe(
          "Common:CannotTransferFolderFromPrivateRoom",
        );
        expect(result.filesToCopy).toHaveLength(0);
      }
    });

    it(
      "returns partial-private-source and passes files through when selection is mixed",
      () => {
        const file1 = makeFile(1);
        const file2 = makeFile(2);
        const result = checkDragDropBoundaries(
          true,
          normalDestInfo,
          [file1, makeFolder(10), file2],
          99,
        );
        expect(result.kind).toBe("partial-private-source");
        if (result.kind === "partial-private-source") {
          expect(result.toastKey).toBe(
            "Common:CannotTransferFolderFromPrivateRoom",
          );
          // Both files must be in the continuation set.
          expect(result.filesToCopy).toHaveLength(2);
          expect(result.filesToCopy).toContainEqual(file1);
          expect(result.filesToCopy).toContainEqual(file2);
        }
      },
    );

    it("allows (no toast) when selection contains only files from private source", () => {
      const result = checkDragDropBoundaries(
        true,
        normalDestInfo,
        [makeFile(1), makeFile(2)],
        99,
      );
      // No folders → encrypted copy proceeds, no error.
      expect(result.kind).toBe("allow");
    });

    it("self-drop: folder whose id equals destFolderId is excluded from drag selection", () => {
      // The reference filters: selection.filter((el) => !el.isFolder || el.id !== destFolderId)
      // If the only folder in the selection IS the destination folder, hasFolders becomes
      // false and the check falls through to allow.
      const destFolderId = 10;
      const result = checkDragDropBoundaries(
        true,
        normalDestInfo,
        [makeFolder(destFolderId), makeFile(1)],
        destFolderId,
      );
      // The folder at id=10 matches destFolderId and is filtered out;
      // only the file remains → no folder error.
      expect(result.kind).toBe("allow");
    });

    it(
      "self-drop: folder at destFolderId filtered, different folder still causes error",
      () => {
        const destFolderId = 10;
        const otherFolder = makeFolder(20);
        const result = checkDragDropBoundaries(
          true,
          normalDestInfo,
          [makeFolder(destFolderId), otherFolder, makeFile(1)],
          destFolderId,
        );
        expect(result.kind).toBe("partial-private-source");
        if (result.kind === "partial-private-source") {
          // The folder at destFolderId is removed but otherFolder remains.
          expect(result.filesToCopy).toHaveLength(1);
        }
      },
    );

    it(
      "private source + null destFolderInfo is treated as non-private dest → case 2",
      () => {
        // null/undefined destFolderInfo means we cannot confirm private → treat as normal dest.
        const result = checkDragDropBoundaries(
          true,
          null,
          [makeFolder(5)],
          99,
        );
        expect(result.kind).toBe("partial-private-source");
      },
    );
  },
);

// ---------------------------------------------------------------------------
// isPrivateDestination via rootFolderType=Rooms (second branch of the OR):
//
//   const isDestInsideSameRoom =
//     sourceInPrivateRoom && destFolderInfo?.rootFolderType === FolderType.Rooms;
//
// This handles moves of items within the same private room (subfolder → subfolder).
// The destination is considered private even if private===false (subfolder does
// not carry the private flag, but belongs to the Rooms root).
// ---------------------------------------------------------------------------

describe(
  "checkDragDropBoundaries — isPrivateDestination via rootFolderType=Rooms",
  () => {
    it("non-private source + rooms-container dest → blocks (case 1)", () => {
      // Source: normal folder (non-private). Dest: subfolder inside rooms container.
      // Even if dest.private is false, the Rooms rootFolderType triggers block.
      const result = checkDragDropBoundaries(
        false,
        roomsContainerDest,
        [makeFile(1)],
        99,
      );
      // isDestInsideSameRoom requires sourceInPrivateRoom=true, so this is false here.
      // Only destFolderInfo.private===true matters → dest.private=false → allow.
      expect(result.kind).toBe("allow");
    });

    it(
      "private source + rooms-container dest → isDestInsideSameRoom=true → allow (same room move)",
      () => {
        // Both source and dest are inside the Rooms container → normal move allowed.
        const result = checkDragDropBoundaries(
          true,
          roomsContainerDest,
          [makeFile(1)],
          99,
        );
        // isDestInsideSameRoom = true → isPrivateDestination = true
        // Case 1 requires !sourceInPrivateRoom — here source IS private → skip case 1
        // Case 2 requires !isPrivateDestination — here dest IS private → skip case 2
        // → falls through to allow
        expect(result.kind).toBe("allow");
      },
    );

    it(
      "private source + dest.private=true + Rooms type → allow (same room, private=true)",
      () => {
        const result = checkDragDropBoundaries(
          true,
          { private: true, rootFolderType: FolderType.Rooms },
          [makeFolder(5), makeFile(1)],
          99,
        );
        // isPrivateDestination=true, sourceInPrivateRoom=true → no case matches → allow.
        expect(result.kind).toBe("allow");
      },
    );
  },
);

// ---------------------------------------------------------------------------
// Normal (non-private) case: allow
// ---------------------------------------------------------------------------

describe(
  "checkDragDropBoundaries — Normal case: both source and dest non-private",
  () => {
    it("allows files from normal folder to normal folder", () => {
      const result = checkDragDropBoundaries(
        false,
        normalDestInfo,
        [makeFile(1), makeFile(2)],
        99,
      );
      expect(result.kind).toBe("allow");
    });

    it("allows folders from normal folder to normal folder", () => {
      const result = checkDragDropBoundaries(
        false,
        normalDestInfo,
        [makeFolder(10)],
        99,
      );
      expect(result.kind).toBe("allow");
    });

    it("allows with null destFolderInfo (non-private source)", () => {
      const result = checkDragDropBoundaries(
        false,
        null,
        [makeFile(1)],
        99,
      );
      expect(result.kind).toBe("allow");
    });

    it("allows with undefined destFolderInfo (non-private source)", () => {
      const result = checkDragDropBoundaries(
        false,
        undefined,
        [makeFile(1)],
        99,
      );
      expect(result.kind).toBe("allow");
    });
  },
);

// ---------------------------------------------------------------------------
// Toast key constants are exactly the i18n keys used by the reference client.
// ---------------------------------------------------------------------------

describe("checkDragDropBoundaries — toast key constants match reference", () => {
  it("case 1 toastKey matches Common:CannotTransferToPrivateRoom", () => {
    const result = checkDragDropBoundaries(
      false,
      privateDestInfo,
      [makeFile(1)],
      99,
    );
    expect(result.kind).toBe("block-private-dest");
    if (result.kind === "block-private-dest") {
      // Verified in FilesActionsStore.js:2432
      expect(result.toastKey).toBe("Common:CannotTransferToPrivateRoom");
    }
  });

  it("case 2 toastKey matches Common:CannotTransferFolderFromPrivateRoom", () => {
    const result = checkDragDropBoundaries(
      true,
      normalDestInfo,
      [makeFolder(5)],
      99,
    );
    expect(result.kind).toBe("partial-private-source");
    if (result.kind === "partial-private-source") {
      // Verified in FilesActionsStore.js:2446
      expect(result.toastKey).toBe(
        "Common:CannotTransferFolderFromPrivateRoom",
      );
    }
  });
});
