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

import { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router";
import AppLoader from "@onlyoffice/apps-ui-kit/components/app-loader";
import {
  frameCallbackData,
  toFrameMethodError,
  createPasswordHash,
  frameCallCommand,
  frameHandlePing,
} from "@docspace/shared/utils/common";

const Sdk = ({
  frameConfig,
  setFrameConfig,
  login,
  loginWithCode,
  logout,
  loadCurrentUser,
  isLoaded,
  getSettings,
  i18n,
}) => {
  const [isDataReady, setIsDataReady] = useState(false);

  const { mode } = useParams();

  const callCommand = useCallback(
    () => frameCallCommand("setConfig", { src: window.location.origin }),
    [frameCallCommand],
  );

  const callCommandLoad = useCallback(
    () => frameCallCommand("setIsLoaded"),
    [frameCallCommand],
  );

  useEffect(() => {
    if (window.parent && !frameConfig?.frameId && isLoaded) {
      callCommand();
    }
  }, [callCommand, isLoaded]);

  useEffect(() => {
    if (isDataReady) {
      callCommandLoad();
    }
  }, [callCommandLoad, isDataReady]);

  useEffect(() => {
    if (mode === "system" && !isDataReady) {
      setIsDataReady(true);
    }
  }, [mode, isDataReady]);

  useEffect(() => {
    if (window.ClientConfig && window.parent)
      window.ClientConfig.isFrame = true;
  }, []);

  const handleMessage = async (e) => {
    if (window.self === window.parent || e.source !== window.parent) return;

    const eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    if (frameHandlePing(eventData)) return;

    if (eventData.data) {
      const { data, methodName, callId } = eventData.data;

      let res;

      try {
        switch (methodName) {
          case "setConfig":
            {
              const requests = await Promise.all([
                setFrameConfig(data),
                data.locale && i18n?.changeLanguage(data.locale),
              ]);
              res = requests[0];
            }
            break;
          case "createHash":
            {
              const { password, hashSettings } = data;
              res = createPasswordHash(password, hashSettings);
            }
            break;
          case "getUserInfo":
            res = await loadCurrentUser();
            break;
          case "getHashSettings":
            {
              const settings = await getSettings();
              res = settings.passwordHash;
            }
            break;
          case "login":
            {
              const { email, passwordHash, code } = data;
              res = code
                ? { url: await loginWithCode(email, passwordHash, code) }
                : await login(email, passwordHash);
            }
            break;
          case "logout":
            res = await logout();
            break;
          default:
            res = "Wrong method for this mode";
        }
      } catch (err) {
        res = toFrameMethodError(err);
      }
      frameCallbackData(res, callId);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [handleMessage]);

  if (!frameConfig) return;

  return <AppLoader />;
};

export const Component = inject(({ authStore, settingsStore, userStore }) => {
  const { login, loginWithCode, logout } = authStore;
  const { theme, setFrameConfig, frameConfig, getSettings, isLoaded } =
    settingsStore;
  const { loadCurrentUser } = userStore;

  return {
    theme,
    setFrameConfig,
    frameConfig,
    login,
    loginWithCode,
    logout,
    getSettings,
    loadCurrentUser,
    isLoaded,
  };
})(withTranslation(["Common"])(observer(Sdk)));
