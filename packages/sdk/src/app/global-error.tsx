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

import { useCallback, useEffect, useState } from "react";

import { ThemeProviderComponent } from "@docspace/ui-kit/components/theme-provider";
import { Error520SSR } from "@docspace/shared/components/errors/Error520";
import { getUser } from "@docspace/shared/api/people";
import { getSettings } from "@docspace/shared/api/settings";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

import useTheme from "@/hooks/useTheme";
import useDeviceType from "@/hooks/useDeviceType";
import useI18N from "@/hooks/useI18N";

import type FirebaseHelper from "@docspace/shared/utils/firebase";

import pkg from "../../package.json";

const CHUNK_RELOAD_FLAG = "sdk.chunkErrorReloaded";

const isChunkLoadError = (error: Error) =>
  error.name === "ChunkLoadError" ||
  /Loading chunk [\w-]+ failed/i.test(error.message ?? "");

export default function GlobalError({ error }: { error: Error }) {
  const [shouldReload] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (!isChunkLoadError(error)) return false;
    return !window.sessionStorage.getItem(CHUNK_RELOAD_FLAG);
  });

  const [user, setUser] = useState<TUser>();
  const [settings, setSettings] = useState<TSettings>();

  const { i18n } = useI18N({ settings, user });
  const { currentDeviceType } = useDeviceType();
  const { theme } = useTheme({
    initialTheme: user?.theme,
    i18n,
  });
  const [firebaseHelper, setFirebaseHelper] = useState<
    FirebaseHelper | undefined
  >(undefined);

  useEffect(() => {
    const fb = settings?.firebase;
    if (!fb?.apiKey) return;
    let cancelled = false;
    import("@docspace/shared/utils/firebase").then((mod) => {
      if (cancelled) return;
      setFirebaseHelper(new mod.default(fb));
    });
    return () => {
      cancelled = true;
    };
  }, [settings?.firebase]);

  const getData = useCallback(async () => {
    const [userData, settingsData] = await Promise.all([
      getUser().catch(() => undefined),
      getSettings().catch(() => undefined),
    ]);

    if (userData) setUser(userData);
    if (settingsData && typeof settingsData !== "string")
      setSettings(settingsData);
  }, []);

  useEffect(() => {
    if (shouldReload) {
      window.sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
      window.location.reload();
      return;
    }

    getData();
  }, [getData, shouldReload]);

  if (shouldReload) {
    return (
      <html lang="en">
        <body />
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <ThemeProviderComponent theme={theme}>
          <Error520SSR
            key={
              firebaseHelper
                ? "with-firebase"
                : settings
                  ? "with-settings"
                  : "initial"
            }
            i18nProp={i18n}
            errorLog={error}
            version={pkg.version}
            user={user ?? ({} as TUser)}
            firebaseHelper={firebaseHelper}
            currentDeviceType={currentDeviceType}
          />
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
