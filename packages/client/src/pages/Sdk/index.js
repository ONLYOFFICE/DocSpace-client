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
import AppLoader from "@docspace/ui-kit/components/app-loader";
import RoomSelector from "@docspace/ui-kit/selectors/Room";
import {
  frameCallEvent,
  frameCallbackData,
  createPasswordHash,
  frameCallCommand,
  frameHandlePing,
} from "@docspace/shared/utils/common";
import { getSelectFormatTranslation } from "@docspace/shared/utils";
import { RoomsType } from "@docspace/shared/enums";
import api from "@docspace/shared/api";
import FilesSelector from "../../components/FilesSelector";

const Sdk = ({
  t,
  frameConfig,
  setFrameConfig,
  login,
  logout,
  loadCurrentUser,
  getIcon,
  isLoaded,
  getSettings,
  userId,
  updateProfileCulture,
  getRoomsIcon,
  getFilesSettings,
  getPrimaryLink,
  logoText,
}) => {
  const [isDataReady, setIsDataReady] = useState(false);

  const { mode } = useParams();
  const selectorType = new URLSearchParams(window.location.search).get(
    "selectorType",
  );

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
    getFilesSettings();
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
                userId &&
                  data.locale &&
                  updateProfileCulture(userId, data.locale),
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
              const { email, passwordHash } = data;
              res = await login(email, passwordHash);
            }
            break;
          case "logout":
            res = await logout();
            break;
          default:
            res = "Wrong method for this mode";
        }
      } catch (err) {
        res = err;
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

  const onSelectRoom = useCallback(
    async (data) => {
      const enrichedData = data[0];

      enrichedData.icon =
        enrichedData.icon === ""
          ? await getRoomsIcon(enrichedData.roomType, false, 32)
          : enrichedData.iconOriginal;

      const isSharedRoom =
        enrichedData.roomType === RoomsType.PublicRoom ||
        ((enrichedData.roomType === RoomsType.CustomRoom ||
          enrichedData.roomType === RoomsType.FormRoom) &&
          enrichedData.shared);

      if (isSharedRoom) {
        const { sharedTo } = await getPrimaryLink(enrichedData.id);
        const { id, title, requestToken, primary } = sharedTo;
        enrichedData.requestTokens = [{ id, primary, title, requestToken }];
      }

      frameCallEvent({ event: "onSelectCallback", data: [enrichedData] });
    },
    [frameCallEvent, getRoomsIcon, getPrimaryLink],
  );

  const onSelectFile = useCallback(
    async (data) => {
      const enrichedData = {
        ...data,
        icon: getIcon(64, data.fileExst),
      };

      if (data.inPublic) {
        const { sharedTo } = await api.files.getFileLink(data.id);
        const { id, title, requestToken, primary } = sharedTo;
        enrichedData.requestTokens = [{ id, primary, title, requestToken }];
      }

      frameCallEvent({ event: "onSelectCallback", data: enrichedData });
    },
    [frameCallEvent, getIcon],
  );

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
  }, [frameCallEvent]);

  let component;

  if (!frameConfig) return;

  const selectorOpenRoot =
    selectorType !== "userFolderOnly" &&
    selectorType !== "roomsOnly" &&
    !frameConfig?.id;

  switch (mode) {
    case "room-selector": {
      const cancelButtonProps = frameConfig?.showSelectorCancel
        ? {
            withCancelButton: true,
            cancelButtonLabel: frameConfig?.cancelButtonLabel,
            onCancel: onClose,
          }
        : {};

      const headerProps = frameConfig?.showSelectorHeader
        ? {
            withHeader: true,
            headerProps: { headerLabel: "", isCloseable: false },
          }
        : { withPadding: false };

      component = (
        <RoomSelector
          {...cancelButtonProps}
          {...headerProps}
          onSubmit={onSelectRoom}
          withSearch={frameConfig?.withSearch}
          submitButtonLabel={frameConfig?.acceptButtonLabel}
          roomType={frameConfig?.roomType}
          onSelect={() => {}}
          setIsDataReady={setIsDataReady}
          isMultiSelect={false}
        />
      );
      break;
    }
    case "file-selector":
      component = (
        <FilesSelector
          isPanelVisible
          embedded
          withHeader={frameConfig?.showSelectorHeader}
          isSelect
          setIsDataReady={setIsDataReady}
          onSelectFile={onSelectFile}
          onClose={onClose}
          withBreadCrumbs={frameConfig?.withBreadCrumbs}
          withSubtitle={frameConfig?.withSubtitle}
          filterParam={frameConfig?.filterParam}
          isUserOnly={selectorType === "userFolderOnly"}
          isRoomsOnly={selectorType === "roomsOnly"}
          withCancelButton={frameConfig?.showSelectorCancel}
          withSearch={frameConfig?.withSearch}
          acceptButtonLabel={frameConfig?.acceptButtonLabel}
          cancelButtonLabel={frameConfig?.cancelButtonLabel}
          currentFolderId={frameConfig?.id}
          openRoot={selectorOpenRoot}
          descriptionText={getSelectFormatTranslation(
            t,
            frameConfig?.filterParam || "",
            logoText,
          )}
          headerProps={{ isCloseable: false }}
          withPadding={frameConfig?.showSelectorHeader}
        />
      );
      break;
    case "system":
      component = <AppLoader />;
      break;
    default:
      component = <AppLoader />;
  }

  return component;
};

export const Component = inject(
  ({
    authStore,
    settingsStore,
    filesSettingsStore,
    peopleStore,
    userStore,
    filesStore,
  }) => {
    const { login, logout } = authStore;
    const {
      theme,
      setFrameConfig,
      frameConfig,
      getSettings,
      isLoaded,
      logoText,
    } = settingsStore;
    const { loadCurrentUser, user } = userStore;
    const { updateProfileCulture } = peopleStore.targetUserStore;
    const { getIcon, getRoomsIcon, getFilesSettings } = filesSettingsStore;
    const { getPrimaryLink } = filesStore;

    return {
      theme,
      setFrameConfig,
      frameConfig,
      login,
      logout,
      getSettings,
      loadCurrentUser,
      getIcon,
      getRoomsIcon,
      isLoaded,
      updateProfileCulture,
      userId: user?.id,
      getFilesSettings,
      getPrimaryLink,
      logoText,
    };
  },
)(
  withTranslation([
    "JavascriptSdk",
    "Common",
    "Settings",
    "Translations",
    "Files",
  ])(observer(Sdk)),
);
