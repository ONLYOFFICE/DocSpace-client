// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import { useCallback, useState, useLayoutEffect, useMemo } from "react";

import { ThemeProvider } from "@docspace/shared/components/theme-provider";
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
          <ThemeProvider theme={theme}>
            <Error520SSR
              i18nProp={i18n}
              errorLog={error}
              version={pkg.version}
              user={user ?? ({} as TUser)}
              firebaseHelper={firebaseHelper}
              currentDeviceType={currentDeviceType}
            />
          </ThemeProvider>
        ) : null}
      </body>
    </html>
  );
}
