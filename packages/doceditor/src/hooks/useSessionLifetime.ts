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

import { getUser } from "@docspace/shared/api/people";
import type { TUser } from "@docspace/shared/api/people/types";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { EDITOR_ID } from "@docspace/shared/constants";

const MAX_TIMEOUT_MS = 2 ** 31 - 1;
const RETRY_SECONDS = 30;

const useSessionLifetime = (user?: TUser) => {
  React.useEffect(() => {
    if (!user?.id || !user.authCookieLifetime || user.authCookieLifetime <= 0)
      return undefined;

    let timerId: number | undefined;
    let disposed = false;

    const kick = () => {
      const { pathname, search, origin } = window.location;
      const loginUrl = window.ClientConfig?.proxy?.url || origin;

      sessionStorage.setItem("referenceUrl", `${origin}${pathname}${search}`);
      sessionStorage.setItem("loggedOutUserId", user.id);

      window.DocEditor?.instances[EDITOR_ID]?.requestClose();
      window.location.replace(combineUrl(loginUrl, "/login"));
    };

    const schedule = (seconds: number) => {
      timerId = window.setTimeout(
        verify,
        Math.min(Math.max(seconds + 1, 1) * 1000, MAX_TIMEOUT_MS),
      );
    };

    const verify = async () => {
      let self: TUser | undefined;
      let failed = false;

      try {
        self = (await getUser()) as TUser | undefined;
      } catch {
        failed = true;
      }

      if (disposed) return;

      if (failed) {
        schedule(RETRY_SECONDS);
        return;
      }

      if (!self?.id) {
        kick();
        return;
      }

      if (self.authCookieLifetime && self.authCookieLifetime > 0)
        schedule(self.authCookieLifetime);
    };

    schedule(user.authCookieLifetime);

    return () => {
      disposed = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [user?.id, user?.authCookieLifetime]);
};

export default useSessionLifetime;
