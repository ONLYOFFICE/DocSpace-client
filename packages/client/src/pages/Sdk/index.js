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

import { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router";
import AppLoader from "@docspace/shared/components/app-loader";
import RoomSelector from "@docspace/shared/selectors/Room";
import {
  frameCallEvent,
  frameCallbackData,
  createPasswordHash,
  frameCallCommand,
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
    if (window.ClientConfig && window.parent)
      window.ClientConfig.isFrame = true;
    getFilesSettings();
  }, []);

  const { mode } = useParams();
  const selectorType = new URLSearchParams(window.location.search).get(
    "selectorType",
  );

  const handleMessage = async (e) => {
    const eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    if (eventData.data) {
      const { data, methodName } = eventData.data;

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
      frameCallbackData(res);
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
