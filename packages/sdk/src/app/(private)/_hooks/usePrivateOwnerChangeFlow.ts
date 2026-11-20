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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { ShareAccessRights } from "@docspace/shared/enums";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import { useEncryption } from "@docspace/shared/context/encryption";
import {
  countMissingFilesOfRefusedOwnerChange,
  prepareNewOwner,
} from "@docspace/shared/services/private-room/room-member-flows";

import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type ChangeOwnerArgs = {
  roomId: number;
  newOwnerId: string;
  currentUserId: string;
};

type LeaveRoomArgs = {
  roomId: number;
  userId: string;
};

type UsePrivateOwnerChangeFlowReturn = {
  /**
   * Wraps the candidate's missing files, then transfers ownership via
   * files/owner. Resolves with false after a refusal it has shown.
   */
  changeOwner: (args: ChangeOwnerArgs) => Promise<boolean>;
  /**
   * Leave the room: drops the user's membership (access=None), as
   * FilesActionsStore.onLeaveRoom does.
   */
  leaveRoom: (args: LeaveRoomArgs) => Promise<void>;
  isLoading: boolean;
};

export const usePrivateOwnerChangeFlow =
  (): UsePrivateOwnerChangeFlowReturn => {
    const { t } = useTranslation(["Common"]);
    const { requireIdentity } = useEncryption();
    const [isLoading, setIsLoading] = React.useState(false);

    // Spec: private-rooms/sdk-surface, "SDK owner change wraps the candidate's missing files"
    const changeOwner = React.useCallback(
      async ({
        roomId,
        newOwnerId,
        currentUserId,
      }: ChangeOwnerArgs): Promise<boolean> => {
        const controller = registerCryptoOperation();
        setIsLoading(true);
        try {
          const identity = await requireIdentity();
          if (!identity) {
            toastr.error(t("Common:EncryptionUnlockRequired"));
            return false;
          }
          const { missingFileIds } = await prepareNewOwner({
            roomId,
            candidateId: newOwnerId,
            currentUserId,
            identity,
          });
          if (missingFileIds.length > 0) {
            toastr.error(
              t("Common:EncryptedReencryptPartialFailure", {
                count: missingFileIds.length,
              }),
            );
            return false;
          }
          await api.files.setFileOwner(newOwnerId, [roomId]);
          return true;
        } catch (error) {
          const count = await countMissingFilesOfRefusedOwnerChange(
            error,
            roomId,
            newOwnerId,
          );
          toastr.error(
            count > 0
              ? t("Common:EncryptedReencryptPartialFailure", { count })
              : getEncryptionErrorMessage(t, error),
          );
          return false;
        } finally {
          releaseCryptoOperation(controller);
          setIsLoading(false);
        }
      },
      [t, requireIdentity],
    );

    // Spec: private-rooms/sdk-surface, "Leaving a private room drops the role without a revocation of its own"
    const leaveRoom = React.useCallback(
      async ({ roomId, userId }: LeaveRoomArgs): Promise<void> => {
        await api.rooms.updateRoomMemberRole(roomId, {
          invitations: [{ id: userId, access: ShareAccessRights.None }],
        });
      },
      [],
    );

    return { changeOwner, leaveRoom, isLoading };
  };
