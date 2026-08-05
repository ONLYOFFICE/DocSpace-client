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

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { getActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import {
  isRotationRunning,
  runRotationForAllRooms,
  RoomListingError,
  RotationConflictError,
  isRotationRunningFor,
  rotationSignature,
  type RewrapSummary,
  type RotationProgressSnapshot,
} from "./rotation-runner";

/**
 * Progress state for the identity rotation across private rooms.
 * `null` means idle; a value means rotation is in progress or just finished.
 */
export type RotationProgress = RotationProgressSnapshot | null;

export type SecondaryProgressSetter = (data: {
  operation: string;
  operationId: string;
  percent?: number;
  completed?: boolean;
  alert?: boolean;
}) => void;

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
    newPublicKeyId: string,
    oldKeyId?: string,
  ) => Promise<RewrapSummary | null>;
};

type Deps = {
  setSecondaryProgressBarData?: SecondaryProgressSetter;
};

export function useRotateIdentityForRooms(
  deps: Deps = {},
): RotateIdentityForRoomsHook {
  const { setSecondaryProgressBarData } = deps;
  const { t } = useTranslation(["Common"]);
  const [rotationProgress, setRotationProgress] =
    useState<RotationProgress>(null);

  const rotateForAllRooms = useCallback(
    async (
      oldIdentity: IdentityKeyPair | null,
      newIdentity: IdentityKeyPair,
      currentUserId: string,
      newPublicKeyId: string,
      oldKeyId?: string,
    ): Promise<RewrapSummary | null> => {
      if (!oldIdentity) {
        // No unlocked identity before generation — nothing to re-wrap.
        return null;
      }

      const signature = rotationSignature(currentUserId, newPublicKeyId);
      const coalescedDuplicate = isRotationRunningFor(signature);
      const operationId = `keyRotation_${newPublicKeyId}`;

      const reportProgress = (progress: RotationProgressSnapshot) => {
        setRotationProgress(progress);
        const percent =
          progress.filesTotal > 0
            ? Math.floor((progress.filesDone / progress.filesTotal) * 100)
            : progress.roomsTotal > 0
              ? Math.floor((progress.roomsDone / progress.roomsTotal) * 100)
              : 0;
        setSecondaryProgressBarData?.({
          operation: OPERATIONS_NAME.roomReencryption,
          operationId,
          percent,
        });
      };

      try {
        const summary = await runRotationForAllRooms({
          oldIdentity,
          newIdentity,
          currentUserId,
          oldKeyId: oldKeyId ?? getActiveKeyId(currentUserId) ?? "",
          newPublicKeyId,
          onProgress: reportProgress,
        });

        setRotationProgress(null);

        if (coalescedDuplicate) return summary;

        if (summary.roomsTotal > 0) {
          setSecondaryProgressBarData?.({
            operation: OPERATIONS_NAME.roomReencryption,
            operationId,
            percent: 100,
            completed: true,
            alert: summary.filesFailed > 0,
          });
        }

        if (summary.filesFailed === 0) {
          if (summary.filesDone > 0) {
            toastr.success(t("Common:RotatingIdentitySuccess"));
          }
          // No files → no toast (user had empty rooms or no encrypted files).
        } else if (summary.filesDone > 0) {
          toastr.warning(
            t("Common:RotatingIdentityPartialFailure", {
              count: summary.filesFailed,
            }),
          );
        } else {
          toastr.error(t("Common:RotatingIdentityFailed"));
        }

        return summary;
      } catch (err) {
        setRotationProgress(null);
        if (err instanceof RotationConflictError) {
          console.warn(err.message);
          toastr.warning(t("Common:RotatingIdentityFailed"));
          return null;
        }
        if (err instanceof RoomListingError) {
          console.error(err.message, err.cause);
        } else {
          console.error("Identity rotation failed:", err);
        }
        toastr.error(t("Common:RotatingIdentityFailed"));
        setSecondaryProgressBarData?.({
          operation: OPERATIONS_NAME.roomReencryption,
          operationId,
          percent: 100,
          completed: true,
          alert: true,
        });
        return null;
      }
    },
    [t, setSecondaryProgressBarData],
  );

  return { rotationProgress, rotateForAllRooms };
}
