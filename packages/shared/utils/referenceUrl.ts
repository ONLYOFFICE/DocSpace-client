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

// A tab sent to the login page keeps the page it left in referenceUrl, so
// logging in brings the user back to it. loggedOutUserId names the user the
// page is reopened for (PrivateRoute checks it once someone has logged in);
// without it the page is reopened for whoever logs in. sessionUserId is the
// user the tab last showed: PrivateRoute and the editor keep it.

/**
 * Keeps the page a tab is leaving for the login page, for a caller that does
 * not know whose session ended: a 401, an anonymous answer after the cookie
 * is gone. The page is named after the user the tab was showing, so it is
 * reopened for that user alone and never for whoever logs in next in this
 * tab - another user would only meet an access error there. A tab that never
 * learned its user keeps the page for anyone, as a link opened in a new tab
 * must lead whoever logs in to it.
 */
export const keepPageForLogin = (href: string = window.location.href) => {
  sessionStorage.setItem("referenceUrl", href);

  const sessionUserId = sessionStorage.getItem("sessionUserId");
  if (sessionUserId) {
    sessionStorage.setItem("loggedOutUserId", sessionUserId);
  }
};
