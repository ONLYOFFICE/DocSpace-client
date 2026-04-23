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
