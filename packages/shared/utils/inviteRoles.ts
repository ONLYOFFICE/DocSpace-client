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

import { EmployeeType, RoomsType } from "../enums";
import { filterPaidRoleOptions } from "./filterPaidRoleOptions";

type TRoleOption = Parameters<typeof filterPaidRoleOptions>[0][number];

/** The invitee as the invite panel holds them: a user of a portal type, or a group. */
export type TInvitee = {
  type?: EmployeeType | null;
  isGroup?: boolean;
  isVisitor?: boolean;
};

/**
 * The roles a room's invite panel offers one invitee: the paid roles (room
 * owner, room manager, an agent's Agent manager) are disabled for a User, a
 * Guest and a group, and left to the portal owner, DocSpace admins and room
 * admins. In an agent that leaves a User with Member only.
 */
export const getInviteeRoleOptions = <T extends TRoleOption>(
  options: T[],
  invitee: TInvitee,
): T[] =>
  invitee.isGroup ||
  invitee.type === EmployeeType.User ||
  invitee.type === EmployeeType.Guest
    ? (filterPaidRoleOptions(options) as T[])
    : options;

/**
 * Whether the invite panel of a room of this type offers the person or group
 * found by its search: an agent takes portal users by name only, no guest,
 * new or existing, and no group, which the server refuses in any role.
 */
export const isInviteeOffered = (
  roomType: RoomsType | number | null | undefined,
  invitee: TInvitee,
): boolean =>
  roomType !== RoomsType.AiProjectRoom ||
  (!invitee.isGroup &&
    !invitee.isVisitor &&
    invitee.type !== EmployeeType.Guest);
