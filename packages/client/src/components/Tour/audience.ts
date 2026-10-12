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

/**
 * Who the tour is talking to. The sections give these three groups genuinely
 * different pages — different sidebar items, a creation banner or none, an
 * info panel that manages members or only lists them — so each gets its own
 * step list and its own wording for the anchors they share.
 *
 * - `admin` — portal owner, DocSpace admin and room admin. They create rooms,
 *   agents and form spaces, and manage members and access links.
 * - `user` — a paid user (collaborator). Works inside the rooms they were
 *   added to and can create content there, but cannot create rooms.
 * - `guest` — a visitor. View-oriented: no personal Files section, no Trash,
 *   no creation, and the info panel is read-only.
 */
export type TourAudience = "admin" | "user" | "guest";

type TourUser = {
  isOwner?: boolean;
  isAdmin?: boolean;
  isVisitor?: boolean;
  isCollaborator?: boolean;
} | null;

/**
 * Map the current user onto a tour audience.
 *
 * Room admins have no flag of their own — being neither owner, admin, visitor
 * nor collaborator *is* the room-admin role (the same definition
 * `AuthStore.isRoomAdmin` uses), which is why they fall through to `admin`.
 */
export function getTourAudience(user: TourUser | undefined): TourAudience {
  if (!user) return "guest";
  if (user.isVisitor) return "guest";
  if (user.isCollaborator) return "user";
  return "admin";
}
