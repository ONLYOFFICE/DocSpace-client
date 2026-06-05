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

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import { getRooms } from "@docspace/shared/api/rooms";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import { rotateOwnIdentityForRoom } from "@docspace/shared/services/private-room/room-encryption";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

/**
 * Progress state for the identity rotation across private rooms.
 * `null` means idle; a value means rotation is in progress or just finished.
 */
export type RotationProgress = {
  /** Rooms processed so far. */
  roomsDone: number;
  /** Total private rooms found. */
  roomsTotal: number;
  /** Cumulative file progress across all rooms. */
  filesDone: number;
  filesTotal: number;
} | null;

export type RotateIdentityForRoomsHook = {
  /** Current rotation progress — null when idle. */
  rotationProgress: RotationProgress;
  /**
   * Enumerate the caller's private rooms and re-wrap every encrypted file DEK
   * from `oldIdentity` to `newIdentity`. Pass `null` for `oldIdentity` to skip
   * rotation silently (e.g. no key was unlocked before generation).
   */
  rotateForAllRooms: (
    oldIdentity: IdentityKeyPair | null,
    newIdentity: IdentityKeyPair,
    currentUserId: string,
  ) => Promise<void>;
};

/**
 * Fetches all private rooms (paginated) and runs rotateOwnIdentityForRoom on
 * each, accumulating progress and showing summary toasts when done.
 *
 * This hook is intentionally side-effect-free during render; `rotateForAllRooms`
 * is the only entry point.
 */
export function useRotateIdentityForRooms(): RotateIdentityForRoomsHook {
  const { t } = useTranslation(["Common"]);
  const [rotationProgress, setRotationProgress] =
    useState<RotationProgress>(null);

  const rotateForAllRooms = useCallback(
    async (
      oldIdentity: IdentityKeyPair | null,
      newIdentity: IdentityKeyPair,
      currentUserId: string,
    ) => {
      if (!oldIdentity) {
        // No unlocked identity before generation — nothing to re-wrap.
        return;
      }

      // Collect all private rooms across pages.
      const privateRooms: TRoom[] = [];
      const filter = RoomsFilter.clean();
      filter.type = String(RoomsType.CustomRoom);
      filter.searchArea = RoomSearchArea.Active;
      filter.pageCount = 100;
      filter.page = 0;

      try {
        let hasMore = true;
        while (hasMore) {
          // eslint-disable-next-line no-await-in-loop
          const result = await getRooms(filter);
          const batch = result.folders.filter(
            (r: TRoom) => r.private === true,
          );
          privateRooms.push(...batch);

          const fetched = result.startIndex + result.folders.length;
          hasMore = fetched < result.total;
          filter.page += 1;
        }
      } catch (err) {
        console.error("Failed to list private rooms for key rotation:", err);
        toastr.error(t("Common:RotatingIdentityFailed"));
        return;
      }

      if (privateRooms.length === 0) {
        // No private rooms — nothing to do.
        return;
      }

      // Initialise progress so the UI can show a spinner.
      setRotationProgress({
        roomsDone: 0,
        roomsTotal: privateRooms.length,
        filesDone: 0,
        filesTotal: 0,
      });

      let totalFiles = 0;
      let totalDone = 0;
      let totalFailed = 0;

      for (let i = 0; i < privateRooms.length; i++) {
        const room = privateRooms[i];
        try {
          // eslint-disable-next-line no-await-in-loop
          const results = await rotateOwnIdentityForRoom(room.id, {
            currentUserId,
            oldIdentity,
            newIdentity,
            onProgress: (done, total) => {
              totalFiles = Math.max(totalFiles, total);
              setRotationProgress({
                roomsDone: i,
                roomsTotal: privateRooms.length,
                filesDone: totalDone + done,
                filesTotal:
                  totalFiles +
                  // estimate remaining rooms as 0 files so progress doesn't
                  // jump backwards when a later room has fewer files.
                  0,
              });
            },
          });

          const failed = results.filter((r) => !r.success).length;
          totalFailed += failed;
          const roomFileDone = results.length;
          totalDone += roomFileDone;
          totalFiles += roomFileDone;
        } catch (err) {
          console.error(
            `Identity rotation failed for room ${room.id}:`,
            err,
          );
          // Count as a failed room but continue with others.
          totalFailed += 1;
        }

        setRotationProgress({
          roomsDone: i + 1,
          roomsTotal: privateRooms.length,
          filesDone: totalDone,
          filesTotal: totalFiles,
        });
      }

      // Clear progress so the UI returns to idle state.
      setRotationProgress(null);

      // Summary toast.
      if (totalFailed === 0) {
        if (totalDone > 0) {
          toastr.success(t("Common:RotatingIdentitySuccess"));
        }
        // No files → no toast (user had empty rooms or no encrypted files).
      } else if (totalDone > 0) {
        toastr.warning(
          t("Common:RotatingIdentityPartialFailure", {
            count: totalFailed,
          }),
        );
      } else {
        toastr.error(t("Common:RotatingIdentityFailed"));
      }
    },
    [t],
  );

  return { rotationProgress, rotateForAllRooms };
}
