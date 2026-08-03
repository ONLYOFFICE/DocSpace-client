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

import { getRooms } from "@docspace/shared/api/rooms";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import { rotateOwnIdentityForRoom } from "@docspace/shared/services/private-room/room-encryption";
import {
  clearRotationState,
  setRotationState,
} from "@docspace/shared/services/encryption/rotation-state";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

export type RotationProgressSnapshot = {
  roomsDone: number;
  roomsTotal: number;
  filesDone: number;
  filesTotal: number;
};

export type RewrapSummary = {
  roomsTotal: number;
  filesTotal: number;
  filesDone: number;
  filesFailed: number;
  filesUnreadable: number;
  failedRoomIds: number[];
};

export class RoomListingError extends Error {
  constructor(cause: unknown) {
    super("failed to list private rooms for key rotation");
    this.name = "RoomListingError";
    this.cause = cause;
  }
}

export class RotationConflictError extends Error {
  constructor() {
    super("another key rotation is already in progress");
    this.name = "RotationConflictError";
  }
}

type RunParams = {
  oldIdentity: IdentityKeyPair;
  newIdentity: IdentityKeyPair;
  currentUserId: string;
  oldKeyId: string;
  newPublicKeyId: string;
  onProgress?: (progress: RotationProgressSnapshot) => void;
};

export function rotationSignature(
  currentUserId: string,
  newPublicKeyId: string,
): string {
  return `${currentUserId}:${newPublicKeyId}`;
}

let activeRun: Promise<RewrapSummary> | null = null;
let activeSignature: string | null = null;

export function isRotationRunning(): boolean {
  return activeRun !== null;
}

export function isRotationRunningFor(signature: string): boolean {
  return activeRun !== null && activeSignature === signature;
}

export function runRotationForAllRooms(
  params: RunParams,
): Promise<RewrapSummary> {
  const signature = rotationSignature(
    params.currentUserId,
    params.newPublicKeyId,
  );
  if (activeRun !== null) {
    if (activeSignature === signature) return activeRun;
    return Promise.reject(new RotationConflictError());
  }
  const run = executeRotation(params).finally(() => {
    activeRun = null;
    activeSignature = null;
  });
  activeRun = run;
  activeSignature = signature;
  return run;
}

async function listPrivateRooms(): Promise<TRoom[]> {
  const privateRooms: TRoom[] = [];
  const filter = RoomsFilter.clean();
  filter.type = String(RoomsType.CustomRoom);
  filter.searchArea = RoomSearchArea.Active;
  filter.pageCount = 100;
  filter.page = 0;

  let hasMore = true;
  while (hasMore) {
    // eslint-disable-next-line no-await-in-loop
    const result = await getRooms(filter);
    privateRooms.push(...result.folders.filter((r: TRoom) => r.private === true));
    const fetched = result.startIndex + result.folders.length;
    hasMore = fetched < result.total;
    filter.page += 1;
  }
  return privateRooms;
}

async function executeRotation(params: RunParams): Promise<RewrapSummary> {
  const {
    oldIdentity,
    newIdentity,
    currentUserId,
    oldKeyId,
    newPublicKeyId,
    onProgress,
  } = params;

  let privateRooms: TRoom[];
  try {
    privateRooms = await listPrivateRooms();
  } catch (err) {
    throw new RoomListingError(err);
  }

  if (privateRooms.length === 0) {
    clearRotationState(currentUserId);
    return {
      roomsTotal: 0,
      filesTotal: 0,
      filesDone: 0,
      filesFailed: 0,
      filesUnreadable: 0,
      failedRoomIds: [],
    };
  }

  const startedAt = Date.now();
  const failedRoomIds: number[] = [];
  let totalFiles = 0;
  let totalDone = 0;
  let totalFailed = 0;
  let totalUnreadable = 0;

  const checkpoint = (roomsDone: number) => {
    setRotationState(currentUserId, {
      oldKeyId,
      newKeyId: newPublicKeyId,
      newPublicKeyId,
      startedAt,
      roomsTotal: privateRooms.length,
      roomsDone,
      failedRoomIds: failedRoomIds.length > 0 ? failedRoomIds : undefined,
    });
  };
  checkpoint(0);

  const beforeUnloadGuard = (event: BeforeUnloadEvent) => {
    event.preventDefault();
  };
  window.addEventListener("beforeunload", beforeUnloadGuard);

  onProgress?.({
    roomsDone: 0,
    roomsTotal: privateRooms.length,
    filesDone: 0,
    filesTotal: 0,
  });

  try {
    for (let i = 0; i < privateRooms.length; i++) {
      const room = privateRooms[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const results = await rotateOwnIdentityForRoom(Number(room.id), {
          currentUserId,
          oldIdentity,
          newIdentity,
          newPublicKeyId,
          onProgress: (done) => {
            onProgress?.({
              roomsDone: i,
              roomsTotal: privateRooms.length,
              filesDone: totalDone + done,
              filesTotal: totalFiles,
            });
          },
        });

        const failed = results.filter((r) => !r.success).length;
        if (failed > 0) failedRoomIds.push(Number(room.id));
        totalFailed += failed;
        totalUnreadable += results.filter((r) => r.unreadable).length;
        totalDone += results.length - failed;
        totalFiles += results.length;
      } catch (err) {
        console.error(`Identity rotation failed for room ${room.id}:`, err);
        failedRoomIds.push(Number(room.id));
        totalFailed += 1;
      }

      checkpoint(i + 1);
      onProgress?.({
        roomsDone: i + 1,
        roomsTotal: privateRooms.length,
        filesDone: totalDone,
        filesTotal: totalFiles,
      });
    }
  } finally {
    window.removeEventListener("beforeunload", beforeUnloadGuard);
  }

  if (totalFailed === 0) {
    clearRotationState(currentUserId);
  } else {
    checkpoint(privateRooms.length);
  }

  return {
    roomsTotal: privateRooms.length,
    filesTotal: totalFiles,
    filesDone: totalDone,
    filesFailed: totalFailed,
    filesUnreadable: totalUnreadable,
    failedRoomIds,
  };
}
