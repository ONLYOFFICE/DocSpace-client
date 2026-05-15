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

import { useCallback, useState, useLayoutEffect, useMemo } from "react";

import { ThemeProviderComponent } from "@docspace/ui-kit/components/theme-provider";
import { Error520SSR } from "@docspace/shared/components/errors/Error520";
import { getUser } from "@docspace/shared/api/people";
import { getSettings } from "@docspace/shared/api/settings";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  TFirebaseSettings,
  TSettings,
} from "@docspace/shared/api/settings/types";

import useTheme from "@/hooks/useTheme";
import useDeviceType from "@/hooks/useDeviceType";
import useI18N from "@/hooks/useI18N";

import FirebaseHelper from "@docspace/shared/utils/firebase";

import pkg from "../../package.json";

export default function GlobalError({ error }: { error: Error }) {
  const [user, setUser] = useState<TUser>();
  const [settings, setSettings] = useState<TSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setError] = useState<boolean>(false);

  const { i18n } = useI18N({ settings, user });
  const { currentDeviceType } = useDeviceType();
  const { theme } = useTheme({ initialTheme: user?.theme, i18n });
  const firebaseHelper = useMemo(() => {
    return new FirebaseHelper(settings?.firebase ?? ({} as TFirebaseSettings));
  }, [settings?.firebase]);

  const getData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userData, settingsData] = await Promise.all([
        getUser(),
        getSettings(),
      ]);

      setSettings(settingsData);
      setUser(userData);
    } catch (e) {
      setError(true);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    getData();
  }, [getData]);

  if (isError) return;

  return (
    <html lang={i18n.language}>
      <body>
        {!isLoading ? (
          <ThemeProviderComponent theme={theme}>
            <Error520SSR
              i18nProp={i18n}
              errorLog={error}
              version={pkg.version}
              user={user ?? ({} as TUser)}
              firebaseHelper={firebaseHelper}
              currentDeviceType={currentDeviceType}
            />
          </ThemeProviderComponent>
        ) : null}
      </body>
    </html>
  );
}
