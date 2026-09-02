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
 * Who may *open* the Developer Tools section.
 *
 * The single source of truth for the rule enforced by the route guard in
 * `routes/Route.private.tsx`: guests never get in, and room admins / users are
 * kept out too when the portal turns on "limit access to developer tools"
 * (Settings -> Security -> Workspace access).
 *
 * This answers "will the page open", not "may the reader be told the section
 * exists" - see `isDevToolsOffered` for the second question. Anything that
 * navigates must ask this one, so we never send someone into a 403.
 */
export const hasDevToolsAccess = (
  user:
    | { isVisitor?: boolean; isAdmin?: boolean; isOwner?: boolean }
    | null
    | undefined,
  limitedAccessDevToolsForUsers: boolean | undefined,
) => {
  if (!user || user.isVisitor) return false;

  return !limitedAccessDevToolsForUsers || !!user.isAdmin || !!user.isOwner;
};

/**
 * Whether the Developer Tools content is offered to this reader at all.
 *
 * Deliberately weaker than `hasDevToolsAccess`, and the difference is the whole
 * point: a portal that has switched the section off for everyone below a full
 * admin hides it outright, but a reader who simply lacks the rights still gets
 * the cards, the descriptions and the documentation links - only the actions
 * behind them are refused, with a toast that says why. A feature that is turned
 * off is absent; a feature that is not yours is visible but closed.
 *
 * Guests are on the second side of that line: the section is switched on for
 * the portal, so they are shown what it is, and every way into it answers with
 * the explanation instead of a 403.
 */
export const isDevToolsOffered = (
  user: { isAdmin?: boolean; isOwner?: boolean } | null | undefined,
  limitedAccessDevToolsForUsers: boolean | undefined,
) => !limitedAccessDevToolsForUsers || !!user?.isAdmin || !!user?.isOwner;

/**
 * Who may open the Docs Connect page.
 *
 * The service is sold and hosted by us, so it exists in SaaS only - a
 * standalone portal has no Docs Connect at all, whoever is asking. Beyond that
 * it is a page of the Developer Tools section and opens for whoever the section
 * opens for; what an admin has and a room admin has not is the right to
 * *configure* it, which the page itself refuses (see `canManageDocsConnect`).
 */
export const canOpenDocsConnect = (
  user:
    | { isVisitor?: boolean; isAdmin?: boolean; isOwner?: boolean }
    | null
    | undefined,
  standalone?: boolean,
  limitedAccessDevToolsForUsers?: boolean,
) => !standalone && hasDevToolsAccess(user, limitedAccessDevToolsForUsers);

/**
 * Who may connect an editors instance.
 *
 * Connecting one is a portal-wide operation, so it stays with portal admins and
 * the owner. Everyone else reads the same page with the action disabled and an
 * explanation above it, which is why this is a separate question from
 * `canOpenDocsConnect` rather than a stricter version of it.
 */
export const canManageDocsConnect = (
  user: { isAdmin?: boolean; isOwner?: boolean } | null | undefined,
  standalone?: boolean,
) => !standalone && !!user && (!!user.isAdmin || !!user.isOwner);
