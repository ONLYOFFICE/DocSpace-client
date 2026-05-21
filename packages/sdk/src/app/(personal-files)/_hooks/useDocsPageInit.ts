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

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { setAuthToken } from "@docspace/shared/api/client";

import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import { useDocsSettingsStore } from "../_store/DocsSettingsStore";
import { useDocsUserStore } from "../_store/DocsUserStore";

type UseDocsPageInitParams = {
  authToken: string;
  filesSettings: TFilesSettings;
  portalSettings: TSettings;
  user?: TUser;
};

export const useDocsPageInit = ({
  authToken,
  filesSettings,
  portalSettings,
  user,
}: UseDocsPageInitParams): boolean => {
  useSDKConfig();

  const docsSettingsStore = useDocsSettingsStore();
  const docsUserStore = useDocsUserStore();
  const filesSettingsStore = useFilesSettingsStore();
  const settingsStore = useSettingsStore();
  const [isReady, setIsReady] = useState(false);
  const initialised = useRef(false);

  useLayoutEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    docsSettingsStore.setFilesSettings(filesSettings);
    filesSettingsStore.setFilesSettings(filesSettings);
    settingsStore.setDisplayAbout(portalSettings.displayAbout);

    if (user) {
      docsUserStore.setUser(user);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!window.ClientConfig)
      window.ClientConfig = {} as NonNullable<typeof window.ClientConfig>;
    const prevIsFrame = window.ClientConfig.isFrame;
    window.ClientConfig.isFrame = true;

    if (authToken) {
      document.cookie = `asc_auth_key=${encodeURIComponent(authToken)}; path=/; SameSite=Lax`;
      setAuthToken(authToken);
    }

    return () => {
      if (window.ClientConfig) {
        window.ClientConfig.isFrame = prevIsFrame;
      }
    };
  }, [authToken]);

  return isReady;
};
