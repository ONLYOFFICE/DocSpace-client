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

import { useEffect } from "react";

import { request } from "@docspace/shared/api/client";

// Logging out sends every open tab to the login page, but logging in again
// happens in one of them only: the others keep showing the form for a
// session that is alive again. Each such tab asks the API when the user comes
// back to it and, once the session is alive, opens the portal root - from
// there the private route returns the tab to the page it kept in
// referenceUrl, provided the same user logged in.
export const useReturnWhenLoggedInElsewhere = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    let checking = false;
    // Set on cleanup: a check still in flight then must not navigate, or it
    // would override where the login form itself is taking the user.
    let cancelled = false;

    const check = async () => {
      if (checking || document.visibilityState !== "visible") return;

      checking = true;

      try {
        const isAuthenticated = await request({
          method: "get",
          url: "/authentication",
          skipUnauthorized: true,
        });

        if (isAuthenticated === true && !cancelled)
          window.location.replace("/");
      } catch {
        // No answer about the session: stay on the form.
      } finally {
        checking = false;
      }
    };

    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [enabled]);
};
