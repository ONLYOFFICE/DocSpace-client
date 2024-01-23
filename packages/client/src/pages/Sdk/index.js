import React, { useEffect, useCallback, useRef } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router-dom";
import { Button } from "@docspace/shared/components/button";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import AppLoader from "@docspace/common/components/AppLoader";
import RoomSelector from "@docspace/shared/selectors/Room";
import FilesSelector from "../../components/FilesSelector";
import {
  frameCallEvent,
  frameCallbackData,
  createPasswordHash,
  frameCallCommand,
} from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";

import styled from "styled-components";

import Logo from "PUBLIC_DIR/images/light_small_logo.react.svg";

const FlexBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sdk = ({
  t,
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
  const newWindow = useRef(null);

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
      setFrameConfig(null);
    };
  }, [handleMessage]);

  // useEffect(() => {
  //   frameConfig && newWindow.current && newWindow.current.postMessage(frameConfig, window.location.origin);
  //   return () => {
  //     newWindow.current = null;
  //   };
  // }, [frameConfig]);

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

  const openRoomSelector = () => {
    newWindow.current = window.open(
      `/sdk/room-selector`,
      "_blank",
      `width=${frameConfig?.width ?? 600},height=${frameConfig?.height ?? 400}`,
    );
  };
  const openFileSelector = () => {
    newWindow.current = window.open(
      `/sdk/file-selector`,
      "_blank",
      `width=${frameConfig?.width ?? 600},height=${frameConfig?.height ?? 400}`,
    );
  };

  switch (mode) {
    case "room-selector":
      component = frameConfig?.isButtonMode ? (
        <FlexBox>
          <Button
            scale={false}
            size="small"
            label={frameConfig?.buttonText || t("SelectToDocSpace")}
            isHovered
            primary
            onClick={openRoomSelector}
            icon={frameConfig?.buttonWithLogo ? <Logo /> : undefined}
          />
        </FlexBox>
      ) : (
        <RoomSelector
          withCancelButton={frameConfig?.showSelectorCancel}
          withHeader={frameConfig?.showSelectorHeader}
          onAccept={onSelectRoom}
          onCancel={onClose}
          withSearch={frameConfig?.withSearch}
          withoutBackButton
          acceptButtonLabel={frameConfig?.acceptButtonLabel}
          cancelButtonLabel={frameConfig?.cancelButtonLabel}
          roomType={frameConfig?.roomType}
          onSelect={() => {}}
        />
      );
      break;
    case "file-selector":
      component = frameConfig?.isButtonMode ? (
        <FlexBox>
          <Button
            scale={false}
            size="small"
            label={frameConfig?.buttonText || t("SelectToDocSpace")}
            isHovered
            primary
            onClick={openFileSelector}
            icon={frameConfig?.buttonWithLogo ? <Logo /> : undefined}
          />
        </FlexBox>
      ) : (
        <FilesSelector
          isPanelVisible={true}
          embedded={true}
          withHeader={frameConfig?.showSelectorHeader}
          isSelect={true}
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
})(withTranslation(["JavascriptSdk"])(observer(Sdk)));