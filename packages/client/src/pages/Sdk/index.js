import React, { useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router-dom";
import Button from "@docspace/components/button";
import { ColorTheme, ThemeType } from "@docspace/components/ColorTheme";
import AppLoader from "@docspace/common/components/AppLoader";
import RoomSelector from "../../components/RoomSelector";
import FilesSelector from "../../components/FilesSelector";
import {
  frameCallEvent,
  frameCallbackData,
  createPasswordHash,
  frameCallCommand,
} from "@docspace/common/utils";
import { RoomsType } from "@docspace/common/constants";

const Sdk = ({
  frameConfig,
  match,
  setFrameConfig,
  login,
  logout,
  loadCurrentUser,
  getIcon,
  isLoaded,
  getSettings,
  user,
  updateProfileCulture,
  getRoomsIcon,
  getPrimaryLink,
}) => {
  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
      setFrameConfig(null);
    };
  }, [handleMessage]);

  const callCommand = useCallback(
    () => frameCallCommand("setConfig"),
    [frameCallCommand]
  );

  useEffect(() => {
    if (window.parent && !frameConfig && isLoaded) {
      callCommand("setConfig");
    }
  }, [callCommand, isLoaded]);

  const { mode } = useParams();

  const selectorType = new URLSearchParams(window.location.search).get(
    "selectorType"
  );

  const toRelativeUrl = (data) => {
    try {
      const url = new URL(data);
      const rel = url.toString().substring(url.origin.length);
      return rel;
    } catch {
      return data;
    }
  };

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
                user &&
                  data.locale &&
                  updateProfileCulture(user.id, data.locale),
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
            res = "Wrong method";
        }
      } catch (e) {
        res = e;
      }
      frameCallbackData(res);
    }
  };

  const onSelectRoom = useCallback(
    async (data) => {
      if (data[0].logo.large !== "") {
        data[0].icon = toRelativeUrl(data[0].logo.large);
      } else {
        data[0].icon = await getRoomsIcon(data[0].roomType, false, 32);
      }

      if (data[0].roomType === RoomsType.PublicRoom) {
        const { sharedTo } = await getPrimaryLink(data[0].id);
        data[0].requestToken = sharedTo?.requestToken;
      }

      frameCallEvent({ event: "onSelectCallback", data });
    },
    [frameCallEvent]
  );

  const onSelectFile = useCallback(
    (data) => {
      data.icon = getIcon(64, data.fileExst);

      frameCallEvent({ event: "onSelectCallback", data });
    },
    [frameCallEvent]
  );

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
  }, [frameCallEvent]);

  const onCloseCallback = !!frameConfig?.events.onCloseCallback
    ? {
        onClose,
      }
    : {};

  let component;

  switch (mode) {
    case "room-selector":
      component = (
        <RoomSelector
          withCancelButton={frameConfig?.showSelectorCancel}
          withHeader={frameConfig?.showSelectorHeader}
          onAccept={onSelectRoom}
          onCancel={onClose}
          withSearch={frameConfig?.withSearch}
          withoutBackButton
          acceptButtonLabel={frameConfig?.acceptButtonLabel}
          cancelButtonLabel={frameConfig?.cancelButtonLabel}
        />
      );
      break;
    case "file-selector":
      component = (
        <FilesSelector
          isPanelVisible={true}
          embedded={true}
          withHeader={frameConfig?.showSelectorHeader}
          isSelect={true}
          onSelectFile={onSelectFile}
          onClose={onClose}
          filterParam={"ALL"}
          isUserOnly={selectorType === "userFolderOnly"}
          isRoomsOnly={selectorType === "roomsOnly"}
          withCancelButton={frameConfig?.showSelectorCancel}
        />
      );
      break;
    default:
      component = <AppLoader />;
  }

  return component;
};

export default inject(({ auth, settingsStore, peopleStore, filesStore }) => {
  const { login, logout, userStore } = auth;
  const { theme, setFrameConfig, frameConfig, getSettings, isLoaded } =
    auth.settingsStore;
  const { loadCurrentUser, user } = userStore;
  const { updateProfileCulture } = peopleStore.targetUserStore;
  const { getIcon, getRoomsIcon } = settingsStore;
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
    user,
    getPrimaryLink,
  };
})(observer(Sdk));
