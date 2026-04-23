// (c) Copyright Ascensio System SIA 2009-2026
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
