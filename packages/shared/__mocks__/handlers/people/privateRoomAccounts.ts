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


import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import type { EncryptedFilesHandlerHandle } from "../files/encryptedFiles";
import type { RoomMembersHandlerHandle } from "../rooms/roomMembers";

export type PrivateRoomAccountsOptions = {
  /** Accounts that own a private room. */
  owners?: string[];
  /**
   * Accounts that can take the private rooms of another one: they hold an
   * encryption key and a key of every encrypted file of those rooms.
   */
  canTakeRooms?: string[];
  /** The encrypted files whose keys a disabled account or a new guest loses. */
  files?: { current: EncryptedFilesHandlerHandle | null };
  /** The members of a private room, which a new guest leaves. */
  members?: { current: RoomMembersHandlerHandle | null };
  /**
   * The private rooms a data reassignment leaves with the account, since
   * neither the recipient nor the portal owner holds an encryption key.
   */
  keptPrivateRoomIds?: number[];
};

/** EmployeeStatus.Terminated and EmployeeType.Guest. */
const STATUS_TERMINATED = "2";
const TYPE_GUEST = 2;

const okResponse = <T>(response: T): Response =>
  new Response(JSON.stringify({ response, status: 0, statusCode: 200 }), {
    headers: { "Content-Type": "application/json" },
  });

/** PrivateRoomOwnershipException, answered with 403 before anything changes. */
const ownershipResponse = (message: string): Response =>
  new Response(
    JSON.stringify({
      status: 1,
      statusCode: 403,
      error: {
        message,
        type: "ASC.Files.Core.Helpers.PrivateRoomOwnershipException",
      },
    }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );

export const privateRoomAccountsHandlers = (
  port: string,
  opts: PrivateRoomAccountsOptions = {},
) => {
  const api = `${BASE_URL}:${port}/${API_PREFIX}/people`;
  const ownsPrivateRoom = (id: string) => opts.owners?.includes(id) ?? false;

  return [
    /**
     * UserController.UpdateUserStatus. DemandNoPrivateRoomOwnedAsync checks
     * the whole list before anything changes; a disabled account then loses
     * its file keys (TryRevokeFileKeysOfDisabledAsync) and keeps its key
     * pair and its shares, so activating it again restores no file key.
     */
    http.put(`${api}/status/:status`, async ({ params, request }) => {
      const { userIds = [] } = (await request.json()) as {
        userIds?: string[];
      };
      const disabling = String(params.status) === STATUS_TERMINATED;

      if (disabling && userIds.some(ownsPrivateRoom)) {
        return ownershipResponse(
          "The account owns private rooms (1). Before the account is disabled, each room needs another owner: its owner or a DocSpace admin who is a member of it can change the owner",
        );
      }
      if (disabling) opts.files?.current?.revokeFileKeys(userIds);

      return okResponse(
        userIds.map((id) => ({ id, status: Number(params.status) })),
      );
    }),

    /**
     * ReassignController.GetReassignProgress: the finished job names the
     * private rooms it left with the account in `keptPrivateRoomIds`
     * (FileStorageService.ReassignPrivateRoomsAsync), an empty list when
     * every room moved.
     */
    http.get(`${api}/reassign/progress/:userId`, ({ params }) =>
      okResponse({
        id: `1_${params.userId}_ReassignProgressItem`,
        error: "",
        percentage: 100,
        isCompleted: true,
        status: 2,
        keptPrivateRoomIds: opts.keptPrivateRoomIds ?? [],
      }),
    ),

    /**
     * UserController.StartUserTypeUpdate. A change to guest is refused by
     * DemandPrivateRoomsCanPassToAsync while the user named to take the
     * rooms cannot open every private room the account owns. Otherwise the
     * job takes the new guest out of the private rooms with their file keys
     * (LeavePrivateRoomsAsync), which the mock does at once; a later change
     * back to a user restores nothing. The guest's own key pair, which the
     * job deletes too, belongs to the keys mock of that user.
     */
    http.post(`${api}/type`, async ({ request }) => {
      const { type, userId, reassignUserId } = (await request.json()) as {
        type?: number | string;
        userId?: string;
        reassignUserId?: string;
      };
      const toGuest = Number(type) === TYPE_GUEST || type === "Guest";
      const canTake = opts.canTakeRooms?.includes(String(reassignUserId));

      if (toGuest && ownsPrivateRoom(String(userId)) && !canTake) {
        return ownershipResponse(
          "The recipient cannot take the private rooms of this account. The recipient needs an encryption key and the keys of every encrypted file in those rooms",
        );
      }

      if (toGuest) {
        opts.files?.current?.revokeFileKeys([String(userId)]);
        const members = opts.members?.current;
        members?.setMembers(
          members.getMembers().filter((m) => m.id !== String(userId)),
        );
      }

      return okResponse({
        id: `1_${userId}_UpdateUserTypeProgressItem`,
        error: "",
        percentage: 5,
        isCompleted: false,
        status: 1,
      });
    }),
  ];
};
